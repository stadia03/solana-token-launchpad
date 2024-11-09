
import '../styles/formStyle.css'; // Import the CSS file


import { 
  WalletConnectButton,
  WalletMultiButton
 } from '@solana/wallet-adapter-react-ui';

 import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { 
 
  Keypair,
 
  SystemProgram, 
  Transaction
} from "@solana/web3.js";
import {createInitializeMetadataPointerInstruction, 
  createInitializeMint2Instruction, 
  ExtensionType, 
  getMinimumBalanceForRentExemptMint, 
  getMintLen, 
  LENGTH_SIZE, MINT_SIZE, 
  TYPE_SIZE , 
  TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID,
  createInitializeMintInstruction
} from '@solana/spl-token';

import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';


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

  async function createTokenwithMetadata(event){
    event.preventDefault();
    const mintKeypair = Keypair.generate();
    const metadata = {
      mint : mintKeypair.publicKey,
      name: document.getElementById("name").value,
      symbol : document.getElementById("symbol").value,
      uri : document.getElementById("imgURL").value,
      additionalMetadata : [],

    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const lamports =  await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
    console.log(wallet.publicKey, mintKeypair.publicKey);
    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(mintKeypair.publicKey,wallet.publicKey, mintKeypair.publicKey,TOKEN_2022_PROGRAM_ID),
      createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey,wallet.publicKey, TOKEN_2022_PROGRAM_ID),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      })

    );
   
    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mintKeypair);
    await wallet.sendTransaction(transaction, connection);

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
          <label className="label">metadata.json URL:</label>
          <input className="input" id="imgURL" type="text" name="imgURL" required />
        </div>
        <div className="inputGroup">
          <label className="label">Initial Supply:</label>
          <input className="input" id="initialSupply" type="number" name="initialSupply" required />
        </div>
        <button className="button" onClick={createTokenwithMetadata} >Create Token</button>
      </form>
    </div>
    </div>
  );
}