/* globals test expect */

const Web3 = require('web3')
let web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:1248'))

test('Deploy Contract', done => {
  web3.eth.getAccounts().then(accounts => {
    web3.eth.sendTransaction({
      from: accounts[0],
      data: '0x6080604052348015600f57600080fd5b50603580601d6000396000f3006080604052600080fd00a165627a7a72305820f50314badc96cf2df848b358f976e52facd1986d2f3eb5bd7b41071ac667ae480029',
      gas: '0x10cba'
    }).on('transactionHash', hash => {
      expect(hash).toBeTruthy()
      done()
    })
  }).catch(err => {
    console.log(err)
  })
}, 30 * 1000)

test('Send Transaction', done => {
  web3.eth.getAccounts().then(accounts => {
    web3.eth.sendTransaction({
      value: Web3.utils.toHex(Math.round(1000000000000000 * Math.random())),
      to: '0x030e6af4985f111c265ee3a279e5a9f6aa124fd5',
      from: accounts[0]
    }).on('transactionHash', hash => {
      expect(hash).toBeTruthy()
      done()
    })
  }).catch(err => {
    console.log(err)
  })
}, 30 * 1000)

test('Sign Personal and ecRecover', done => {
  let message = 'Frame Test'
  let signed = ''
  web3.eth.getAccounts().then(accounts => {
    web3.eth.personal.sign(message, accounts[0]).then(result => {
      signed = result
      web3.eth.personal.ecRecover(message, signed).then(result => {
        expect(result.toLowerCase()).toBe(accounts[0].toLowerCase())
        console.log(JSON.stringify({ address: accounts[0], msg: message, sig: signed, version: '2' }))
        done()
      }).catch(err => {
        console.log(err)
      })
    }).catch(err => {
      console.log(err)
    })
  })
}, 30 * 1000)
