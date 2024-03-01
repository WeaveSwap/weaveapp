# Cryptocurrency Lending and Borrowing Platform

## Overview

This Ethereum-based platform facilitates decentralized lending and borrowing of cryptocurrencies. Utilizing smart contracts, it enables users to either lend their cryptocurrencies to earn interest or borrow by staking collateral. The platform dynamically adjusts the yield for lenders based on the current demand for each cryptocurrency, ensuring a flexible and responsive financial ecosystem.

## Key Features

- **Dynamic Yield for Lenders**: Interest rates for lenders are not fixed; instead, they adjust dynamically in response to the demand for borrowed assets, optimizing returns for lenders based on market conditions.
- **Collateral-Based Borrowing**: Borrowers can secure loans by staking collateral in a specific cryptocurrency. The platform supports multiple cryptocurrencies, providing flexibility in loan options.
- **Automated Liquidation Mechanism**: To mitigate risk, the platform continuously monitors the loan-to-value (LTV) ratio of each loan. If the LTV exceeds predefined thresholds, the system can automatically liquidate the borrower's collateral to protect the lenders' interests.
- **Decentralized and Secure**: Built on the Ethereum blockchain, the platform operates in a trustless and decentralized manner, ensuring transparency and security for all transactions.
- **Interest and APY Management**: The platform includes features for managing the interest rates and annual percentage yield (APY) for both borrowing and lending, allowing for fine-tuned control over financial incentives.

## Technical Components

### Smart Contracts

#### LendingTracker.sol

Acts as the central hub for managing lending and borrowing activities. It integrates with Chainlink for accurate price feeds and uses internal mechanisms to track user balances, manage collateral, and execute liquidations when necessary.

#### Lending.sol

Manages individual lending pools for different cryptocurrencies. It handles the specifics of depositing and withdrawing funds, calculating yields, and managing the reserve and APY adjustments.

### Hardhat Setup

The project utilizes Hardhat, a flexible Ethereum development environment, for compiling, testing, and deploying smart contracts. Hardhat enhances the development process with advanced features like network management, automatic gas estimation, and console logging.

## Setup Instructions

### Requirements

-   Node.js and npm installed.
-   An Ethereum wallet, such as MetaMask, for interactions with the Ethereum network.

### Project Setup

1. **Clone the Repository**:
    ```sh
    git clone <repository-url>
    ```
2. **Install Dependencies**:
   Navigate to the project folder and install the necessary npm packages.
    ```sh
    npm install
    ```
3. **Compile Contracts**:
   Compile the smart contracts using Hardhat.
    ```sh
    npx hardhat compile
    ```
4. **Deploy Contracts**:
   Deploy the contracts to your chosen network (e.g., local Hardhat network, Ethereum testnet, or mainnet).
    ```sh
    npx hardhat run scripts/deploy.js --network <network-name>
    ```

## Usage

-   **Lending**: Users must approve the LendingTracker contract to access their tokens and then use the `lendToken` function to deposit their cryptocurrencies into the lending pool.
-   **Borrowing**: To borrow, users first stake collateral with the `stakeCollateral` function. They can then borrow against their collateral up to a certain LTV ratio.
-   **Interest and Yield Management**: The platform automatically adjusts yields for lenders based on the borrowing demand. Borrowers pay interest based on the current APY, which is subject to change based on market conditions.
-   **Collateral Liquidation**: The system monitors the LTV ratios in real-time. If a borrower's LTV ratio exceeds the allowed limit, the platform can automatically liquidate the collateral to protect lenders.

## Security Measures

The platform prioritizes security with several measures in place to mitigate risks, including rigorous smart contract testing, integration with reliable oracles for price feeds, and mechanisms to prevent excessive LTV ratios.
