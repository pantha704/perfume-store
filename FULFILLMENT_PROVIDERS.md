# Fulfillment providers

The provider contract is in `lib/fulfillment/types.ts`. A provider implements capabilities plus `quote`, `create`, `getStatus`, `cancel`, and optionally `syncInventory`.

Current adapters: `amazon_mcf`, `shiprocket`, `manual`. Website variants keep stable `sku`; each provider's identifiers/configuration are stored in `variant_fulfillment_mappings`. Checkout resolves the mapping for the configured provider; no Amazon/Shiprocket imports exist in checkout routes.

To add another provider: implement the contract, register it in `lib/fulfillment/index.ts`, extend the database provider check through an additive migration, and add mapping rows. Do not modify Razorpay or cart code.
