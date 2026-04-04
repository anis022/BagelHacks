import { BRIDGES, type Bridge } from "../data/bridges";

export function findBridges(fromChain: string, toChain: string, token: string): Bridge[] {
  return BRIDGES.filter(
    (bridge) =>
      bridge.supportedChains.includes(fromChain) &&
      bridge.supportedChains.includes(toChain) &&
      bridge.supportedTokens.includes(token)
  ).sort((a, b) => a.feePercent - b.feePercent);
}

export function calculateFee(amount: number, feePercent: number): number {
  return parseFloat((amount * (feePercent / 100)).toFixed(6));
}

export function calculateReceiveAmount(amount: number, fee: number): number {
  return parseFloat((amount - fee).toFixed(6));
}
