# Amazon MCF adapter setup

Amazon MCF remains optional. The store can launch with another provider without removing this adapter.

1. Register/authorize the Seller Partner API application for the merchant account.
2. Put LWA client ID/secret/refresh token and marketplace/seller configuration in server secrets.
3. Leave `AMAZON_SPAPI_SANDBOX=true` while validating requests.
4. Map each website variant to the correct Amazon MCF `amazonSku` / inventory seller SKU in `variant_fulfillment_mappings` and enable only validated mappings.
5. Set `AMAZON_MCF_ENABLED=true` only after mappings/API permissions are proven.
6. Set `DEFAULT_FULFILLMENT_PROVIDER=amazon_mcf` only if MCF is actually selected for website orders.
7. The final independent gate is `FULFILLMENT_LIVE_ENABLED=true`.

Never store Seller Central username/password in the application.
