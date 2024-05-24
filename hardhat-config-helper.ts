interface NetworkConfig {
    [key: number]: {
        name: string;
        wethTokenAddress: string;
        lendingPoolAddressProvider: string;
        daiEthPriceFeed: string;
        daiTokenAddress: string;
    };
}

export const networkConfig: NetworkConfig = {
    11155111: {
        name: "sepolia",
        wethTokenAddress: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9",
        lendingPoolAddressProvider: "",
        daiEthPriceFeed: "",
        daiTokenAddress: "",
    },
    31337: {
        name: "hardhat",
        wethTokenAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        lendingPoolAddressProvider:
            "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
        daiTokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
};

export const developmentChains = [31337];
export const DECIMALS = 8;
export const INITIAL_SUPPLY = "1000000000000000000000000";
