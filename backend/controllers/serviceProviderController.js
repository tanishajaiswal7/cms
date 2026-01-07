const ServiceProvider = require("../models/ServiceProvider");

// ➕ Add provider
const createProvider = async (req, res) => {
  try {
    const provider = await ServiceProvider.create(req.body);
    res.status(201).json(provider);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 📄 Get all providers
const getProviders = async (req, res) => {
  try {
    const providers = await ServiceProvider.find();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete provider
const deleteProvider = async (req, res) => {
  try {
    await ServiceProvider.findByIdAndUpdate(
      req.params.id,
      { active: false }
    );
    res.json({ message: "Provider deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔁 Toggle active status
const toggleProviderStatus = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.active = !provider.active; // toggle
    await provider.save();

    res.json(provider);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



module.exports = {
  createProvider,
  getProviders,
  deleteProvider,
  toggleProviderStatus,
};
