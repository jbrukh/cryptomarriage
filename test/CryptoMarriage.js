const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("CryptoMarriage", function () {

  let cryptoMarriage;
  let CryptoMarriage;
  let bride;
  let groom;
  let witness1;
  let witness2;
  let name1 = "Jane Bride";
  let name2 = "John Groom";
  let name3 = "John Witness";
  let name4 = "Jane Witness";
  let uri = "https://gateway.pinata.cloud/ipfs/QmSeo6qDjaZYmcZwSeyM7nbDBSBZan12aTMAT3sqwo9PeR";
    
  before(async function() {
    // signers
    [bride, groom, witness1, witness2, ...addrs] = await ethers.getSigners();
    CryptoMarriage = await ethers.getContractFactory("CryptoMarriage");
  });


  beforeEach(async function() {
    cryptoMarriage = await CryptoMarriage.deploy(bride.address, name1, groom.address, name2, 10000, uri, uri, 'NFT', 'NFT');
    await cryptoMarriage.deployed();
  });

  describe("Deployment", async function() {

    it("Should result in unmarried status by default", async function () {
      expect(await cryptoMarriage.married()).to.be.false;
    });

    it("Should set the right persons", async function() {
      let p = await cryptoMarriage.persons(0);
      expect(p.addr).to.equal(bride.address);
      expect(p.name).to.equal(name1);
      let q = await cryptoMarriage.persons(1);
      expect(q.addr).to.equal(groom.address);
      expect(q.name).to.equal(name2);
    });

  });

  describe("Calling consent function", async function() {

    it("Should allow the bride to call", async function() {
      let tx = await cryptoMarriage.connect(bride).ido();
      await tx.wait();
      expect(await cryptoMarriage.married()).to.be.false;
      let p = await cryptoMarriage.persons(0);
      expect(p.addr).to.equal(bride.address);
      expect(p.ido).to.be.true;
      let q = await cryptoMarriage.persons(1);
      expect(q.addr).to.equal(groom.address);
      expect(q.ido).to.be.false;
    });

    it("Should allow the groom to call", async function() {
      await cryptoMarriage.connect(groom).ido();
      expect(await cryptoMarriage.married()).to.be.false;
      let p = await cryptoMarriage.persons(0);
      expect(p.addr).to.equal(bride.address);
      expect(p.ido).to.be.false;
      let q = await cryptoMarriage.persons(1);
      expect(q.addr).to.equal(groom.address);
      expect(q.ido).to.be.true;
    });

    it("Should change marriage status when both parties consent", async function() {
      await cryptoMarriage.connect(bride).ido();
      await cryptoMarriage.connect(groom).ido();
      expect(await cryptoMarriage.married()).to.be.true;
    });

    it("Should result in an error if the caller is not in the constructor", async function() {
      let tx = cryptoMarriage.connect(witness1).ido();
      await expect(tx).to.be.revertedWith("Only bride and groom can call this.");
    });
  });

  describe("When married", async function() {

    beforeEach(async function() {
      await cryptoMarriage.connect(bride).ido();
      await cryptoMarriage.connect(groom).ido();
    });

    it("Should have married status", async function() {
      expect(await cryptoMarriage.married()).to.be.true;
    });

    it("Should revert status if groom divorces", async function() {
      await cryptoMarriage.connect(groom).divorce();
      expect(await cryptoMarriage.married()).to.be.false;
    });

    it("Should revert status if bride divorces", async function() {
      await cryptoMarriage.connect(bride).divorce();
      expect(await cryptoMarriage.married()).to.be.false;
    });

    it("Only bridge and groom can call divorce", async function() {
      await expect(cryptoMarriage.connect(witness1).divorce()).to.be.revertedWith('Only bride and groom can call this.');
    });
  });

  describe("Events", async function() {

    it("Should emit a Marriage event upon marriage", async function() {
      await cryptoMarriage.connect(bride).ido();
      let tx = cryptoMarriage.connect(groom).ido();

      await expect(tx).to.emit(cryptoMarriage, 'Marriage').withArgs(bride.address, name1, groom.address, name2);
    });

    it("Should emit a Divorce event upon divorce", async function() {
      await cryptoMarriage.connect(bride).ido();
      await cryptoMarriage.connect(groom).ido();
      expect(await cryptoMarriage.married()).to.be.true;

      let tx = cryptoMarriage.connect(bride).divorce();
      await expect(tx).to.emit(cryptoMarriage, 'Divorce').withArgs(bride.address, name1, groom.address, name2);
      expect(await cryptoMarriage.married()).to.be.false;
    });

  });

  describe("NFTs", async function() {
    it("Should send NFTs when married", async function() {
      await cryptoMarriage.connect(bride).ido();
      await cryptoMarriage.connect(groom).ido();

      expect(await cryptoMarriage.ownerOf(1)).to.be.equal(bride.address);
      expect(await cryptoMarriage.ownerOf(2)).to.be.equal(groom.address);
    });

    it("Should send NFTs when witnessing", async function() {
      await cryptoMarriage.connect(bride).ido();
      await cryptoMarriage.connect(groom).ido();
      await cryptoMarriage.connect(witness1).witness(name3);
      expect(await cryptoMarriage.ownerOf(3)).to.be.equal(witness1.address);
    });

  });

  describe("When divorced", async function() {
    beforeEach(async function() {
      await cryptoMarriage.connect(bride).ido();
      await cryptoMarriage.connect(groom).ido();
      await cryptoMarriage.connect(bride).divorce();
    });

    it("Should drop married status", async function() {
      expect(await cryptoMarriage.married()).to.be.false;
    });

    it("Should not allow re-marriage by bride", async function() {
      expect(cryptoMarriage.connect(bride).ido()).to.be
        .revertedWith('The parties previously divorced, instantiate a new contract.');
    });
    
    it("Should not allow re-marriage by groom", async function() {
      expect(cryptoMarriage.connect(groom).ido()).to.be
        .revertedWith('The parties previously divorced, instantiate a new contract.');
    });
    
    it("Should not allow re-marriage by both", async function() {
      expect(cryptoMarriage.connect(groom).ido()).to.be
        .revertedWith('The parties previously divorced, instantiate a new contract.');
      expect(cryptoMarriage.connect(bride).ido()).to.be
        .revertedWith('The parties previously divorced, instantiate a new contract.');
    });
  });

  describe("Witnessing", async function() {
    beforeEach(async function() {
      await cryptoMarriage.connect(bride).ido();
      await cryptoMarriage.connect(groom).ido();
    });
    it("Should account a witness", async function() {
      await cryptoMarriage.connect(witness1).witness(name3);
      let p = await cryptoMarriage.witnesses(0);
      expect(p.addr).to.equal(witness1.address);
      expect(p.name).to.equal(name3);
    });
    it("Should not allow a witness to call the method twice", async function() {
      await cryptoMarriage.connect(witness1).witness(name3);
      let tx = cryptoMarriage.connect(witness1).witness(name3);
      await expect(tx).to.be.revertedWith("Witness already witnessed.");
    });
    it("Should event a Witnessing event", async function() {
      let tx = cryptoMarriage.connect(witness1).witness(name3);
      await expect(tx).to.emit(cryptoMarriage, 'Witnessing').withArgs(bride.address, name1, groom.address, name2, witness1.address, name3);
    });
  });

});
