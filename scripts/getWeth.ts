import { parseEther } from "ethers";
import { ethers, network } from "hardhat";
import { networkConfig } from "../hardhat-config-helper";

export const AMOUNT = parseEther("0.1").toString();

export async function getWeth() {
    const accounts = await ethers.getSigners();
    const deployer = accounts[0];
    const chainId = network.config.chainId!;
    const wethTokenAddress = networkConfig[chainId].wethTokenAddress;
    const iWeth = await ethers.getContractAt(
        "IWeth",
        wethTokenAddress,
        deployer
    );
    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1);
    const wethBalance = await iWeth.balanceOf(deployer);
    console.log(`Got ${wethBalance.toString()} WETH`);
}
