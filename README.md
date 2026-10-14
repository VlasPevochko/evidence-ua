# evidence-ua
Base of knowlege
# Website source and publication

GitHub `main` is Evidence UA's source of truth. Make changes through a branch and reviewed PR; merge requires the owner's explicit approval. Keep **all of `dist/`**, including authored HTML/CSS/assets. Sites remains the current host.

Website CI builds and tests the complete snapshot, then automatically publishes full `dist` and provenance artifacts for successful `main` runs. The reviewed v73-to-v76 reconciliation is included in this branch; live Sites deployment still needs a supported GitHub-to-Sites connection after the approved PRs are merged. See [deployment and setup status](docs/DEPLOYMENT.md).
