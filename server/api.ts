import { CryptoPrice } from "@/lib/types";

// Simulate crypto API data
export const getCryptoPrices = async (): Promise<CryptoPrice[]> => {
  return [
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      price: 61245.78,
      percentChange24h: 2.4,
      percentChange7d: 12.8,
      marketCap: 1190000000000,
      logoUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.svg",
      sparkline: "M0,15 L10,13 L20,18 L30,15 L40,20 L50,18 L60,23 L70,20 L80,25 L90,22 L100,28"
    },
    {
      id: 2,
      name: "Ethereum",
      symbol: "ETH",
      price: 3387.25,
      percentChange24h: 1.8,
      percentChange7d: 5.4,
      marketCap: 406840000000,
      logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
      sparkline: "M0,20 L10,18 L20,22 L30,20 L40,15 L50,17 L60,15 L70,13 L80,16 L90,13 L100,10"
    },
    {
      id: 3,
      name: "BNB",
      symbol: "BNB",
      price: 594.12,
      percentChange24h: -0.5,
      percentChange7d: 2.1,
      marketCap: 90420000000,
      logoUrl: "https://cryptologos.cc/logos/bnb-bnb-logo.svg",
      sparkline: "M0,10 L10,15 L20,12 L30,18 L40,15 L50,20 L60,18 L70,25 L80,22 L90,20 L100,25"
    },
    {
      id: 4,
      name: "Solana",
      symbol: "SOL",
      price: 178.45,
      percentChange24h: 3.2,
      percentChange7d: 9.7,
      marketCap: 78550000000,
      logoUrl: "https://cryptologos.cc/logos/solana-sol-logo.svg",
      sparkline: "M0,20 L10,18 L20,15 L30,13 L40,15 L50,12 L60,8 L70,10 L80,7 L90,5 L100,2"
    },
    {
      id: 5,
      name: "Cardano",
      symbol: "ADA",
      price: 0.48,
      percentChange24h: -1.2,
      percentChange7d: -3.5,
      marketCap: 16750000000,
      logoUrl: "https://cryptologos.cc/logos/cardano-ada-logo.svg",
      sparkline: "M0,10 L10,12 L20,15 L30,17 L40,14 L50,16 L60,19 L70,22 L80,24 L90,26 L100,28"
    },
    {
      id: 6,
      name: "XRP",
      symbol: "XRP",
      price: 0.62,
      percentChange24h: 0.8,
      percentChange7d: 4.3,
      marketCap: 33240000000,
      logoUrl: "https://cryptologos.cc/logos/xrp-xrp-logo.svg",
      sparkline: "M0,20 L10,18 L20,16 L30,14 L40,16 L50,18 L60,16 L70,14 L80,12 L90,10 L100,8"
    },
    {
      id: 7,
      name: "Dogecoin",
      symbol: "DOGE",
      price: 0.16,
      percentChange24h: 1.3,
      percentChange7d: 6.7,
      marketCap: 22480000000,
      logoUrl: "https://cryptologos.cc/logos/dogecoin-doge-logo.svg",
      sparkline: "M0,15 L10,13 L20,17 L30,16 L40,14 L50,12 L60,10 L70,8 L80,10 L90,8 L100,6"
    },
    {
      id: 8,
      name: "Polkadot",
      symbol: "DOT",
      price: 8.23,
      percentChange24h: -0.9,
      percentChange7d: -2.6,
      marketCap: 10340000000,
      logoUrl: "https://cryptologos.cc/logos/polkadot-new-dot-logo.svg",
      sparkline: "M0,5 L10,7 L20,9 L30,11 L40,13 L50,15 L60,13 L70,15 L80,17 L90,19 L100,20"
    }
  ];
};
