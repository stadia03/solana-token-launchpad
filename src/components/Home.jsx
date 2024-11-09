
import '../styles/formStyle.css'; // Import the CSS file


import { 
  WalletConnectButton,
  WalletMultiButton
 } from '@solana/wallet-adapter-react-ui';

 import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { 
 
  Connection,
  Keypair,
  LAMPORTS_PER_SOL, 
  PublicKey, 
  SystemProgram, 
  Transaction
} from "@solana/web3.js";
import {createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const apiKey = "DZHbnZioln7-ITlLrhFgZZlcSSiP3yan";

export default function Home() {

  const wallet = useWallet();
  const {connection} = useConnection();



  async function  createToken (event){
    event.preventDefault();
    const name = document.getElementById("name").value;
    const symbol = document.getElementById("symbol").value;
    const imgURL = document.getElementById("imgURL").value;
    const initialSupply = document.getElementById("initialSupply").value;
    console.log(name,symbol,imgURL,initialSupply );
     console.log(connection);
  
    const lamports = await getMinimumBalanceForRentExemptMint(connection);
    const  keypair = Keypair.generate();
    const decimals = 8;
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: keypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId : TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(keypair.publicKey, decimals, wallet.publicKey, wallet.publicKey, TOKEN_PROGRAM_ID),
  );

    transaction.feePayer= wallet.publicKey;
    const recentBlockHash = await connection.getLatestBlockhash(); 
    transaction.recentBlockhash = recentBlockHash.blockhash;
  
    transaction.partialSign(keypair);
    const res = await wallet.sendTransaction(transaction, connection);
    console.log(res);


  }

  return (
    <div>

  
    <div className="container">
      <h1 className="heading">SOLANA TOKEN LAUNCHPAD</h1>
      <WalletMultiButton/>
      <br></br>
      <form className="form">
        <div className="inputGroup">
          <label className="label" >Name:</label>
          <input  className="input"  id="name" type="text" name="name" required />
        </div>
        <div className="inputGroup">
          <label className="label">Symbol:</label>
          <input className="input"  id="symbol" type="text" name="symbol" required />
        </div>
        <div className="inputGroup">
          <label className="label">Image URL:</label>
          <input className="input" id="imgURL" type="text" name="imgURL" required />
        </div>
        <div className="inputGroup">
          <label className="label">Initial Supply:</label>
          <input className="input" id="initialSupply" type="number" name="initialSupply" required />
        </div>
        <button className="button" onClick={createToken} >Create Token</button>
      </form>
    </div>
    </div>
  );
}