# Shiprocket adapter setup

1. Configure Shiprocket API credentials and the exact pickup location/postcode as server secrets.
2. Validate courier serviceability, package dimensions/weights and perfume eligibility with the merchant's actual product/formula.
3. Enable the Shiprocket mapping for each website SKU in `variant_fulfillment_mappings`.
4. Set `SHIPROCKET_ENABLED=true`, then choose it via `DEFAULT_FULFILLMENT_PROVIDER=shiprocket`.
5. Keep `FULFILLMENT_LIVE_ENABLED=false` until quote/create/tracking/cancel tests pass.

The rest of checkout does not change when switching from Amazon MCF to Shiprocket.
