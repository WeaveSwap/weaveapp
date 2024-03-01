// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

// Importing necessary contracts and interfaces
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./Pool.sol";
import "../Dex/WeaveSwap.sol";
import "./LendingTracker.sol";

/**
 * @title LendingTracker
 * @dev Manages lending, borrowing, and collateral operations for a decentralized finance platform.
 * Utilizes external price feeds for valuation and includes functionality for yield farming.
 * This contract is responsible for tracking user interactions with lending pools and their collateralized positions.
 */
contract BorrowingTracker {
    // Events for logging various actions within the contract
    event userBorrowed(
        address indexed user,
        address tokenAddress,
        uint256 tokenAmount
    );
    event userStakedCollateral(
        address indexed user,
        address tokenAddress,
        uint256 tokenAmount
    );
    event userUnstakedCollateral(
        address indexed user,
        address tokenAddress,
        uint256 tokenAmount
    );
    event userReturnedBorrowedToken(
        address indexed user,
        address tokenAddress,
        uint256 receiptId,
        uint256 tokenAmount,
        uint256 interest
    );
    event collateralTerminated(address user);

    // Maximum Loan-to-Value (LTV) ratio for borrowing against collateral
    int256 ltv = 75;

    // Owner of the contract, set at deployment
    address owner;

    // SwapRouter
    SwapRouter swapRouter;

    // Lendingtracker
    LendingTracker lendingTracker;

    // Constructor sets the deploying address as the owner
    constructor(address _lendingTracker) {
        owner = msg.sender;
        lendingTracker = LendingTracker(_lendingTracker);
    }

    // Struct to track borrowing receipts for users
    struct borrowReceipt {
        address tokenAddress;
        uint256 amount;
        uint256 time;
        uint256 apy;
    }

    mapping(address => mapping(address => uint256)) public collateral; // Collateral amount of specific token for user
    mapping(address => address[]) public collateralTokens; // All collateralized token addresses of user

    mapping(address => address[]) public borrowedTokens; // All borrowed token addresses of user
    mapping(address => uint256) public borrowingId; // Current borrowing Id of the user, it increments with each borrow
    mapping(address => mapping(address => uint256[])) public userBorrowReceipts; // All receipt ids for a certain token address of user
    mapping(address => mapping(uint256 => borrowReceipt))
        public borrowReceiptData; // Id to receipt

    /**
     * @notice Allows a user to borrow tokens from a specific lending pool.
     * @dev The function checks for sufficient liquidity and adherence to the loan-to-value (LTV) ratio before permitting the borrow.
     * Updates the user's borrow receipts to keep track of the borrowed amount and terms.
     * @param tokenAddress The address of the token the user wishes to borrow.
     * @param tokenAmount The amount of tokens the user wants to borrow.
     */
    function borrowToken(address tokenAddress, uint256 tokenAmount) public {
        // Checks if the pool exists
        (Pool poolAddress, ) = lendingTracker.tokenToPool(tokenAddress);
        if (address(poolAddress) == address(0)) {
            revert lendingTracker_poolNotAvailable();
        }
        // Liquidity treshold, if ltv is too high
        if (liquidityTreshold(msg.sender, tokenAddress, tokenAmount) >= ltv) {
            revert lendingTracker_amountTooHigh();
        }
        // Borrows from the pool contract
        poolAddress.borrow(tokenAmount); // Checks if there is enough reserve

        // Maps the token address if needed
        if (newTokenChecker(borrowedTokens[msg.sender], tokenAddress) == true) {
            borrowedTokens[msg.sender].push(tokenAddress);
        }
        // Adds funds to a mapping
        userBorrowReceipts[msg.sender][tokenAddress].push(
            borrowingId[msg.sender]
        );
        borrowReceiptData[msg.sender][borrowingId[msg.sender]] = borrowReceipt(
            tokenAddress,
            tokenAmount,
            block.timestamp,
            poolAddress.borrowingAPY()
        );

        // Transfers tokens to user
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        // User receipt Id
        borrowingId[msg.sender] += 1;

        // Event
        emit userBorrowed(msg.sender, tokenAddress, tokenAmount);
    }

    /**
     * @notice Allows users to stake tokens as collateral for borrowing.
     * @dev Transfers tokens from the user to this contract for collateralization. Updates the collateral tracking mappings.
     * @param tokenAddress The address of the token being staked as collateral.
     * @param tokenAmount The amount of the token to stake.
     */
    function stakeCollateral(address tokenAddress, uint256 tokenAmount) public {
        // Checks if pool exists
        (Pool poolAddress, ) = lendingTracker.tokenToPool(tokenAddress);
        if (address(poolAddress) == address(0)) {
            revert lendingTracker_poolNotAvailable();
        }
        // Transfers tokens from user to the contract
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            tokenAmount
        );
        // Maps the token address if needed
        if (
            newTokenChecker(collateralTokens[msg.sender], tokenAddress) == true
        ) {
            collateralTokens[msg.sender].push(tokenAddress);
        }
        // Adds the amount to mapping
        collateral[msg.sender][tokenAddress] += tokenAmount;

        //Event
        emit userStakedCollateral(msg.sender, tokenAddress, tokenAmount);
    }

    /**
     * @notice Permits users to withdraw their staked collateral, provided they have no outstanding loans.
     * @dev Ensures that the withdrawal does not violate the loan-to-value (LTV) requirements.
     * @param tokenAddress The address of the token to unstake.
     * @param tokenAmount The amount of the token to unstake.
     */
    function unstakeCollateral(
        address tokenAddress,
        uint256 tokenAmount
    ) public {
        // Checks if amount is too high and if the user is borrowing any tokens
        if (
            collateral[msg.sender][tokenAddress] - tokenAmount < 0 &&
            borrowedTokens[msg.sender].length > 0
        ) {
            revert lendingTracker_addressNotAllowed();
        }
        // Decreases amount in mapping
        collateral[msg.sender][tokenAddress] -= tokenAmount;
        // Transfers the tokens to user
        IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        // Maps the token address if needed
        if (collateral[msg.sender][tokenAddress] == 0) {
            for (uint256 i; i < collateralTokens[msg.sender].length; i++) {
                if (collateralTokens[msg.sender][i] == tokenAddress) {
                    delete collateralTokens[msg.sender][i];
                }
            }
        }

        //Event
        emit userUnstakedCollateral(msg.sender, tokenAddress, tokenAmount);
    }

    /**
     * @notice Computes the current loan-to-value (LTV) ratio for a user's borrowed funds against their staked collateral.
     * @dev Used to determine if a user's borrowings are within permissible limits. Can also factor in an additional amount
     * being borrowed or provided as collateral.
     * @param user The address of the user.
     * @param additionalTokenAddress Optionally, the address of a token being considered for borrowing/collateral.
     * @param tokenAmount Optionally, the amount of the additional token being considered.
     * @return The LTV ratio as a percentage.
     */
    function liquidityTreshold(
        address user,
        address additionalTokenAddress,
        uint256 tokenAmount
    ) public view returns (int) {
        // It checks the price in USD if collaterall falls below borrowed amount in usd + the apy till date, the collateral get terminated
        int collateralUSD;
        int borrowedUSD;
        // If we want to calculate ltv with additional funds
        (Pool poolAddress, address priceAddress) = lendingTracker.tokenToPool(
            additionalTokenAddress
        );
        if (tokenAmount != 0 && address(poolAddress) != address(0)) {
            int conversion = usdConverter(priceAddress);
            collateralUSD += conversion * int(tokenAmount);
        }
        for (uint256 i; i < collateralTokens[user].length; i++) {
            address tokenAddress = collateralTokens[user][i];
            uint256 amountOfToken = collateral[user][tokenAddress];
            (, address tokenPriceAddress) = lendingTracker.tokenToPool(
                tokenAddress
            );
            // Get conversion to USD
            int conversion = usdConverter(tokenPriceAddress);
            collateralUSD += conversion * int(amountOfToken);
        }
        for (uint256 i; i < borrowedTokens[user].length; i++) {
            address tokenAddress = borrowedTokens[user][i];
            uint256[] storage receiptIds = userBorrowReceipts[user][
                tokenAddress
            ];
            for (uint256 a; a < receiptIds.length; a++) {
                uint256 receiptTIME = borrowReceiptData[msg.sender][
                    receiptIds[a]
                ].time;
                uint256 receiptAMOUNT = borrowReceiptData[msg.sender][
                    receiptIds[a]
                ].amount;
                address receiptAddress = borrowReceiptData[msg.sender][
                    receiptIds[a]
                ].tokenAddress;
                uint256 receiptAPY = borrowReceiptData[msg.sender][
                    receiptIds[a]
                ].apy;
                uint256 borrowInterest = (receiptAMOUNT *
                    receiptTIME *
                    receiptAPY) / (365 days * 100);
                (, address tokenPriceAddress) = lendingTracker.tokenToPool(
                    receiptAddress
                );
                int conversion = usdConverter(tokenPriceAddress);
                borrowedUSD += conversion * int(borrowInterest + receiptAMOUNT);
            }
        }
        return (borrowedUSD * 100) / collateralUSD;
    }

    /**
     * @notice Initiates the liquidation of a user's collateral if their LTV ratio exceeds the maximum permitted value.
     * @dev Meant to be called by an external mechanism (like a keeper) that monitors LTV ratios.
     * @param userAddress The address of the user whose collateral is being liquidated.
     */
    function terminateCollateral(address userAddress) public payable {
        // Check if the ltv is too high, if it is not reverts
        if (liquidityTreshold(userAddress, address(0), 0) <= ltv) {
            revert lendingTracker_addressNotAllowed();
        }
        //Repay the borrowed amounts
        /*
        First: check if any collateral are the same as borrowed so we can just transferm, to avoid cost of swapping
        Next: find the pools to swap tokens
        Last: all remaining tokens get sent to caller
        */
        // First
        // for (uint256 i; i < collateralTokens[userAddress].length; i++) {
        //     for (uint256 a; a < borrowedTokens[userAddress].length; a++) {
        //         if (
        //             collateralTokens[userAddress][i] ==
        //             borrowedTokens[userAddress][a]
        //         ) {
        //             // Collateral token Amount
        //             uint256 collateralAmount = collateral[userAddress][
        //                 collateralTokens[userAddress][i]
        //             ];
        //             address tokenAddress = collateralTokens[userAddress][i];
        //             // Iterate through borrowing ids
        //             for (
        //                 uint256 c;
        //                 c <
        //                 userBorrowReceipts[userAddress][tokenAddress].length;
        //                 c++
        //             ) {
        //                 uint256 id = userBorrowReceipts[userAddress][
        //                     tokenAddress
        //                 ][c];
        //                 uint256 amount = borrowReceiptData[userAddress][id]
        //                     .amount;
        //                 uint256 totalAmount = accruedInterest(
        //                     id,
        //                     userAddress,
        //                     amount
        //                 ) + amount;
        //                 if(collateralAmount - totalAmount >= 0){

        //                 }
        //             }
        //         }
        //     }
        // }

        // terminate user collateral and share it between the lenders
        for (uint256 i; i < collateralTokens[userAddress].length; i++) {
            collateral[msg.sender][collateralTokens[userAddress][i]] = 0;
            delete collateralTokens[msg.sender][i];
        }
        // Swap items, give the terminator reward
        // Reward can be 0.25 of their collateral, due to payable function and node running

        // Event
        emit collateralTerminated(userAddress);
    }

    /**
     * @notice Converts the token amount to its USD equivalent using Chainlink price feeds.
     * @dev Utility function to assist in calculating collateral values and loan amounts.
     * @param priceAddress Address of the Chainlink price feed for the token.
     * @return int The USD value of the token amount based on the latest price feed data.
     */
    function usdConverter(address priceAddress) public view returns (int) {
        (, int answer, , , ) = AggregatorV3Interface(priceAddress)
            .latestRoundData();
        return answer;
    }

    /**
     * @notice Checks if a new token is not already tracked by the user's token array.
     * @dev Utility function to prevent duplicate entries in user token arrays.
     * @param userTokens Array of token addresses the user has interacted with.
     * @param token Address of the token to check.
     * @return bool True if the token is not in the array, false otherwise.
     */
    function newTokenChecker(
        address[] memory userTokens,
        address token
    ) public pure returns (bool) {
        bool newToken = true;
        for (uint256 i; i < userTokens.length; i++) {
            if (token == userTokens[i]) {
                newToken = false;
            }
        }
        return newToken;
    }

    /**
     * @notice Allows a user to return borrowed tokens along with any accrued interest.
     * @dev Calculates interest based on the borrowing APY and time elapsed since the token was borrowed.
     * @param id The unique identifier of the borrow receipt.
     * @param tokenAmount The amount of the borrowed token being returned.
     */
    function returnBorrowedToken(uint256 id, uint256 tokenAmount) public {
        if (borrowReceiptData[msg.sender][id].amount == 0) {
            revert lendingTracker_receiptDoesntExist();
        }
        if (borrowReceiptData[msg.sender][id].amount - tokenAmount < 0) {
            revert lendingTracker_amountTooHigh();
        }
        address tokenAddress = borrowReceiptData[msg.sender][id].tokenAddress;
        borrowReceiptData[msg.sender][id].amount -= tokenAmount;
        uint256 borrowInterest = accruedInterest(id, msg.sender, tokenAmount);
        // From msg sender to this contract
        (Pool poolAddress, ) = lendingTracker.tokenToPool(tokenAddress);
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(poolAddress),
            tokenAmount + borrowInterest
        );
        // Book how much of transaction was yield
        poolAddress.bookYield(borrowInterest);
        // If the whole borrowed amount gets repayed, delete the id and if all the ids for borrowed token get repayed delete borrowed token
        if (borrowReceiptData[msg.sender][id].amount == 0) {
            for (
                uint256 i;
                i < userBorrowReceipts[msg.sender][tokenAddress].length;
                i++
            ) {
                if (userBorrowReceipts[msg.sender][tokenAddress][i] == id) {
                    delete userBorrowReceipts[msg.sender][tokenAddress][i];
                }
            }
            if (userBorrowReceipts[msg.sender][tokenAddress].length == 0) {
                for (uint256 i; i < borrowedTokens[msg.sender].length; i++) {
                    if (borrowedTokens[msg.sender][i] == tokenAddress) {
                        delete borrowedTokens[msg.sender][i];
                    }
                }
            }
        }
        // Event
        emit userReturnedBorrowedToken(
            msg.sender,
            tokenAddress,
            id,
            tokenAmount,
            borrowInterest
        );
    }

    // Accrued interest on loan
    function accruedInterest(
        uint256 _id,
        address _user,
        uint256 tokenAmount
    ) public view returns (uint256) {
        uint256 receiptAPY = borrowReceiptData[_user][_id].apy;
        uint256 receiptTIME = borrowReceiptData[_user][_id].time;
        uint256 fullAmount = borrowReceiptData[_user][_id].amount;
        // Pay the part of the interest the user is repaying
        uint256 borrowInterest = ((((tokenAmount * 100) / fullAmount) *
            receiptTIME *
            receiptAPY) / (365 days * 100)) * 100;
        return borrowInterest;
    }

    // Add Swap router
    function addSwapRouter(address _swapRouter) public {
        if (msg.sender != owner) {
            revert lending_addressNotAllowed();
        }
        swapRouter = SwapRouter(payable(_swapRouter));
    }
}
