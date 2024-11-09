


import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  WalletModalProvider
} from '@solana/wallet-adapter-react-ui';

import '@solana/wallet-adapter-react-ui/styles.css';
import Home from './components/Home';
import Kirat from './components/kirat';

function App() {


  return (
    <>
      <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/DZHbnZioln7-ITlLrhFgZZlcSSiP3yan"}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                   
                    <Home/>
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    </>
  )
}

export default App
