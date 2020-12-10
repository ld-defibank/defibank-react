// import Web3 from 'web3';
import createLedgerSubprovider from '@ledgerhq/web3-subprovider';
import TransportU2F from '@ledgerhq/hw-transport-u2f';
import ProviderEngine from 'web3-provider-engine';
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc';

export default function factory(rpcUrl) {
  const engine = new ProviderEngine();
  const getTransport = () => TransportU2F.create();
  const ledger = createLedgerSubprovider(getTransport, {
    accountsLength: 5,
  });
  engine.addProvider(ledger);
  engine.addProvider(new RpcSubprovider({ rpcUrl }));
  return engine;
}
