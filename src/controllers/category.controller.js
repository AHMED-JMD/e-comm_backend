const { Category, Store, Product } = require("../models");

async function createCategory(req, res) {
  const { name, description } = req.body;

  const category = await Category.create({
    name: String(name).trim(),
    description: description ? String(description).trim() : null,
  });

  return res.status(201).json({
    message: "Category created successfully",
    category,
  });
}

async function listCategories(_req, res) {
  const categories = await Category.findAll({
    order: [["name", "ASC"]],
  });

  return res.status(200).json({ categories });
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  category.name = String(name).trim();
  category.description = description ? String(description).trim() : null;
  await category.save();

  return res.status(200).json({
    message: "Category updated successfully",
    category,
  });
}

async function deleteCategory(req, res) {
  const { id } = req.params;

  const category = await Category.findByPk(id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  const [storesCount, productsCount] = await Promise.all([
    Store.count({ where: { categoryId: category.id } }),
    Product.count({ where: { categoryId: category.id } }),
  ]);

  if (storesCount > 0 || productsCount > 0) {
    return res.status(409).json({
      message:
        "Cannot delete category assigned to existing stores or products. Reassign them first.",
    });
  }

  await category.destroy();
  return res.status(200).json({ message: "Category deleted successfully" });
}

module.exports = {
  createCategory,
  listCategories,
  updateCategory,
  deleteCategory,
};
