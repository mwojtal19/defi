import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { parseEther } from "ethers";
import { ethers, network } from "hardhat";
import { networkConfig } from "../hardhat-config-helper";
import { ILendingPool } from "../typechain-types";
import { AMOUNT, getWeth } from "./getWeth";
const chainId = network.config.chainId!;

async function main() {
    await getWeth();
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    // lending pool
    const lendingPool = await getLendingPool(deployer);
    const lendingPoolAddress = await lendingPool.getAddress();
    console.log(`LendingPool address: ${lendingPoolAddress}`);

    const wethTokenAddress = networkConfig[chainId].wethTokenAddress;
    // approve
    await approveErc20(wethTokenAddress, lendingPoolAddress, AMOUNT, deployer);

    // deposit
    console.log("Depositing...");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
    console.log("Deposited!");

    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer
    );
    const daiPrice = await getDaiPrice();
    const amountDaiToBorrow =
        Number(availableBorrowsETH) * 0.8 * (1 / Number(daiPrice));
    const amountDaiToBorrowWei = parseEther(amountDaiToBorrow.toString());
    console.log(`You can borrow ${amountDaiToBorrow} DAI`);

    //borrow
    const daiTokenAddress = networkConfig[chainId].daiTokenAddress;
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowWei,
        deployer
    );
    await getBorrowUserData(lendingPool, deployer);

    // repay
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer);
    await getBorrowUserData(lendingPool, deployer);
}

async function repay(
    amount: bigint,
    daiAddress: string,
    lendingPool: ILendingPool,
    account: HardhatEthersSigner
) {
    const lendingPoolAddress = await lendingPool.getAddress();
    await approveErc20(
        daiAddress,
        lendingPoolAddress,
        amount.toString(),
        account
    );
    const repayTx = await lendingPool.repay(daiAddress, amount, 2, account);
    await repayTx.wait(1);
    console.log("Repaid!");
}

async function borrowDai(
    daiAddress: string,
    lendingPool: ILendingPool,
    amountDaiToBorrowWei: bigint,
    account: HardhatEthersSigner
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrowWei,
        2,
        0,
        account
    );
    await borrowTx.wait(1);
    console.log("You borrowed DAI!");
}

async function getDaiPrice(): Promise<bigint> {
    const daiEthAddress = networkConfig[chainId].daiEthPriceFeed;
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        daiEthAddress
    );
    const { answer: price } = await daiEthPriceFeed.latestRoundData();
    console.log(`The DAI/ETH price is ${price.toString()}`);
    return price;
}

async function getBorrowUserData(
    lendingPool: ILendingPool,
    account: HardhatEthersSigner
): Promise<{ availableBorrowsETH: bigint; totalDebtETH: bigint }> {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account);
    console.log(`You have ${totalCollateralETH} worth of ETH deposited`);
    console.log(`You have ${totalDebtETH} worth of ETH borrowed`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`);
    return { availableBorrowsETH, totalDebtETH };
}

async function approveErc20(
    contractAddress: string,
    spenderAddress: string,
    amountToSpend: string,
    account: HardhatEthersSigner
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        contractAddress,
        account
    );
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log(`Approved!`);
}

async function getLendingPool(
    account: HardhatEthersSigner
): Promise<ILendingPool> {
    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        networkConfig[chainId].lendingPoolAddressProvider,
        account
    );
    const lendingPoolAddress =
        await lendingPoolAddressProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account
    );
    return lendingPool;
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
