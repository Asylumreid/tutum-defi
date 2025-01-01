import { ethers } from 'ethers'

export interface Window {
  ethereum?: {
    isMetaMask?: boolean;
    request?: (...args: any[]) => Promise<any>;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
    selectedAddress?: string;
  }
}

export interface LendingDashboardProps {
  contract: ethers.Contract;
  address: string;
}