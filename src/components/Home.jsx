
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
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction
} from '@solana/spl-token';

import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { useEffect, useState } from 'react';


export default function Home() {

  const wallet = useWallet();
  const {connection} = useConnection();
  const [mintPublicKey , setMintKey] = useState();
  const [ataCreated , setAtaCreated] = useState();
  let associatedToken;

  async function createTokenwithMetadata(event){
    event.preventDefault();
    const mintKeypair = Keypair.generate();
    setMintKey(mintKeypair.publicKey);
    console.log("thissss"+mintPublicKey);
    const metadata = {
      mint : mintPublicKey,
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
   
   const transactionSign=  await wallet.sendTransaction(transaction, connection);

    console.log(`Transaction Signature: ${transactionSign}`);
    console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
    alert(`Token mint created at ${mintPublicKey}`)



  }

  async function createATA(params) {

     associatedToken = getAssociatedTokenAddressSync(
      mintPublicKey,
      wallet.publicKey,
      false,
      TOKEN_2022_PROGRAM_ID,
  );

  console.log(associatedToken.toBase58()); //logging ata address

    // CREATING ATA
    const transaction2 = new Transaction().add(
      createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          mintPublicKey,
          TOKEN_2022_PROGRAM_ID,
      ),
  );

  const createAtaSign =   await wallet.sendTransaction(transaction2, connection);
  console.log(`Signature of creating ATA: ${createAtaSign}`);
  alert(`Signature of creating ATA: ${createAtaSign}`);
  setAtaCreated(1);

  }

  async function mintToken(event) {
    event.preventDefault();

    const initialSupply = document.getElementById("initialSupply").value;
    
    //MINTING TOKENS TO ATA
        const transaction3 = new Transaction().add(
            createMintToInstruction(
              mintPublicKey, 
              associatedToken, 
              wallet.publicKey, 
              initialSupply, 
              [], 
              TOKEN_2022_PROGRAM_ID)
        );

        const mintTxSign =   await wallet.sendTransaction(transaction3, connection); 
        alert(`Minted! Signature: ${mintTxSign}`);
        console.log("Minted!");
    
  }
  return (
    <div>
      <div className="mini_container">
         <h1 className="heading">SOLANA TOKEN LAUNCHPAD</h1>
      <WalletMultiButton/>
      </div>

  <div className="outer_Container">

  
    <div className="container">
     
      <br></br>
      <form className="form">
      <h3>Create TOKEN</h3>
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
        
        <button className="button" onClick={createTokenwithMetadata} >Create Token</button>
       <p2>Example metadata.json URL</p2>
        <p1>
     https://stadia03.github.io/solana-token-launchpad/metadata.json
     </p1>
      </form>
    
     
    </div>


    <div className="mini_container">
    <button disabled={!mintPublicKey} className="button" onClick={createATA} >Create Associated Token Account</button>
      <br>
      </br>
      <form className="form">
       <h3>Mint token to ATA</h3>
        <div className="inputGroup">
          <label className="label">Initial Supply:</label>
          <input className="input" id="initialSupply" type="number" name="initialSupply" required />
        </div>
        <button disabled={!ataCreated} className="button" onClick={mintToken} >MINT</button>
      </form>
    </div>
   
    </div>

    </div>
  );
}