// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

// Importing required contracts and interfaces
import "./PoolTracker.sol";
import "./LiquidityPool.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

// Error declaration for unswappable token pairs
error SwapRouter_tokensCantBeSwapped();
error SwapRouter_needToCallExistingFunction();

/**
 * @title SwapRouter
 * @dev Facilitates token swaps utilizing defined liquidity pools, offering direct swaps and routed swaps through an intermediary.
 * Leverages the PoolTracker contract to access liquidity pool information and perform asset exchanges.
 */
contract SwapRouter {
    // Emitted after a successful token swap
    event swap(
        address userAddress,
        address address1,
        address address2,
        uint256 address1Amount,
        uint256 address2Amount
    );

    // Reference to the PoolTracker contract for pool operations
    PoolTracker poolTracker;

    // Reentrancy Guard
    bool internal locked;

    /**
     * @dev Modifier to prevent reentrancy attacks.
     */
    modifier noReentrancy() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    /**
     * @param tracker Address of the PoolTracker contract instance.
     */
    constructor(address tracker) {
        poolTracker = PoolTracker(tracker);
    }

    /**
     * @notice Swaps `inputAmount` of `address1` tokens for `address2` tokens.
     * @dev This function supports direct swaps between tokens in a single pool or routed swaps through an intermediary token.
     * Uses PoolTracker to determine the best swap path and perform the exchange.
     * @param address1 The token being sold by the user.
     * @param address2 The token being purchased by the user.
     * @param inputAmount The amount of `address1` tokens to swap.
     */
    function swapAsset(
        address address1,
        address address2,
        uint256 inputAmount
    ) public payable noReentrancy {
        if (poolTracker.exists(address1, address2)) {
            // Direct swap scenario
            LiquidityPool pool = poolTracker.pairToPool(address1, address2);
            uint256 startingBalanceAddress2 = IERC20(address2).balanceOf(
                address(this)
            );
            if (pool.assetOneAddress() == address1) {
                IERC20(address1).transferFrom(
                    msg.sender,
                    address(this),
                    inputAmount
                );
                IERC20(address1).approve(address(pool), inputAmount);
                pool.sellAssetOne{value: pool.swapFee()}(inputAmount);
            } else {
                IERC20(address1).transferFrom(
                    msg.sender,
                    address(this),
                    inputAmount
                );
                IERC20(address1).approve(address(pool), inputAmount);
                pool.sellAssetTwo{value: pool.swapFee()}(inputAmount);
            }
            uint256 amountOutput = IERC20(address2).balanceOf(address(this)) -
                startingBalanceAddress2;
            IERC20(address2).transfer(msg.sender, amountOutput);
            // Unrequired fee
            uint256 unrequiredFee = msg.value - pool.swapFee(); // In case the msg.sender sent more value than it is required
            (bool sent, ) = payable(msg.sender).call{value: unrequiredFee}("");
            require(sent, "Failed to send Ether");
        } else if (poolTracker.tokenToRoute(address1, address2) != address(0)) {
            // Routed swap scenario
            address routingToken = poolTracker.tokenToRoute(address1, address2);
            LiquidityPool pool1 = poolTracker.pairToPool(
                address1,
                routingToken
            );
            LiquidityPool pool2 = poolTracker.pairToPool(
                address2,
                routingToken
            );
            uint256 startingBalance = IERC20(routingToken).balanceOf(
                address(this)
            );
            uint256 startingBalance2 = IERC20(address2).balanceOf(
                address(this)
            );
            //SWAP 1, input token into routing  token
            if (pool1.assetOneAddress() == address1) {
                IERC20(address1).transferFrom(
                    msg.sender,
                    address(this),
                    inputAmount
                );
                IERC20(address1).approve(address(pool1), inputAmount);
                pool1.sellAssetOne{value: pool1.swapFee()}(inputAmount);
            } else {
                IERC20(address1).transferFrom(
                    msg.sender,
                    address(this),
                    inputAmount
                );
                IERC20(address1).approve(address(pool1), inputAmount);
                pool1.sellAssetTwo{value: pool1.swapFee()}(inputAmount);
            }
            //SWAP 2, routing token into output token
            uint256 routingTokenInput = IERC20(routingToken).balanceOf(
                address(this)
            ) - startingBalance;
            if (pool2.assetOneAddress() == address1) {
                IERC20(routingToken).approve(address(pool2), routingTokenInput);
                pool2.sellAssetOne{value: pool2.swapFee()}(routingTokenInput);
            } else {
                IERC20(routingToken).approve(address(pool2), routingTokenInput);
                pool2.sellAssetTwo{value: pool2.swapFee()}(routingTokenInput);
            }
            uint256 address2Output = IERC20(address2).balanceOf(address(this)) -
                startingBalance2;
            IERC20(address2).transfer(msg.sender, address2Output);
            // Unrequired fee
            uint256 unrequiredFee = msg.value -
                pool1.swapFee() -
                pool2.swapFee(); // In case the msg.sender sent more value than it is required
            (bool sent, ) = payable(msg.sender).call{value: unrequiredFee}("");
            require(sent, "Failed to send Ether");
        } else {
            // Assets cant be swapped directly nor routed
            revert SwapRouter_tokensCantBeSwapped();
        }
    }

    /**
     * @notice Estimates the output amount for a swap from `address1` to `address2` given an `inputAmount` of `address1`.
     * @dev Considers direct swaps and routed swaps through an intermediary token, utilizing PoolTracker for calculations.
     * @param address1 The token being sold.
     * @param address2 The token being bought.
     * @param inputAmount The amount of `address1` tokens to swap.
     * @return output The estimated amount of `address2` tokens to be received.
     */
    function getSwapAmount(
        address address1,
        address address2,
        uint256 inputAmount
    ) public view returns (uint256) {
        uint256 output;
        if (poolTracker.exists(address1, address2)) {
            LiquidityPool pool = poolTracker.pairToPool(address1, address2);
            output = pool.getSwapQuantity(address1, inputAmount);
        } else if (poolTracker.tokenToRoute(address1, address2) != address(0)) {
            address routingToken = poolTracker.tokenToRoute(address1, address2);
            LiquidityPool pool1 = poolTracker.pairToPool(
                address1,
                routingToken
            );
            LiquidityPool pool2 = poolTracker.pairToPool(
                address2,
                routingToken
            );
            uint256 routingOutput = pool1.getSwapQuantity(
                address1,
                inputAmount
            );
            output = pool2.getSwapQuantity(routingToken, routingOutput);
        } else {
            // Assets cant be swapped directly nor routed
            revert SwapRouter_tokensCantBeSwapped();
        }
        return output;
    }

    /**
     * @dev Fallback function if address calls unexisting function, but contains msg.data
     */
    fallback() external payable {}

    /**
     * @dev Receive function if address calls unexisting function, without msg.data
     */
    receive() external payable {}
}
