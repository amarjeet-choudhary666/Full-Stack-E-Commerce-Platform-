import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/UserModel";
import { Product } from "../models/ProductModel";
import { Order } from "../models/OrderModel";
import { Category } from "../models/CategoryModel";
// import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

// Get dashboard overview
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const { period = "30" } = req.query; // days
  
  const daysAgo = parseInt(period as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  // Get basic counts
  const [
    totalCustomers,
    totalProducts,
    totalCategories,
    totalOrders,
    recentOrders,
    lowStockProducts
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Product.countDocuments(),
    Category.countDocuments(),
    Order.countDocuments(),
    Order.find()
      .populate("user_id", "name email")
      .sort({ createdAt: -1 })
      .limit(5),
    Product.find({ stock_quantity: { $lte: 10 }, status: "active" })
      .select("name sku stock_quantity")
      .limit(10)
  ]);

  // Get sales data for the period
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ["delivered", "shipped", "confirmed"] }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$final_amount" },
        totalOrdersCount: { $sum: 1 },
        averageOrderValue: { $avg: "$final_amount" }
      }
    }
  ]);

  const sales = salesData[0] || {
    totalSales: 0,
    totalOrdersCount: 0,
    averageOrderValue: 0
  };

  // Get daily sales for chart (last 7 days)
  const dailySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: { $in: ["delivered", "shipped", "confirmed"] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        sales: { $sum: "$final_amount" },
        orders: { $sum: 1 }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);

  const overview = {
    totalCustomers,
    totalProducts,
    totalCategories,
    totalOrders,
    totalSales: sales.totalSales,
    averageOrderValue: Math.round(sales.averageOrderValue || 0),
    recentOrders,
    lowStockProducts,
    dailySales
  };

  return res.status(200).json(
    new ApiResponse(200, overview, "Dashboard overview fetched successfully")
  );
});

// Get sales analytics
export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = "30", groupBy = "day" } = req.query;
  
  const daysAgo = parseInt(period as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  let dateFormat: string;
  switch (groupBy) {
    case "hour":
      dateFormat = "%Y-%m-%d %H:00";
      break;
    case "day":
      dateFormat = "%Y-%m-%d";
      break;
    case "week":
      dateFormat = "%Y-%U";
      break;
    case "month":
      dateFormat = "%Y-%m";
      break;
    default:
      dateFormat = "%Y-%m-%d";
  }

  const salesAnalytics = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ["delivered", "shipped", "confirmed"] }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: dateFormat, date: "$createdAt" }
        },
        totalSales: { $sum: "$final_amount" },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: "$final_amount" }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, salesAnalytics, "Sales analytics fetched successfully")
  );
});

// Get top selling products
export const getTopSellingProducts = asyncHandler(async (req, res) => {
  const { limit = 10, period = "30" } = req.query;
  
  const daysAgo = parseInt(period as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const topProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ["delivered", "shipped", "confirmed"] }
      }
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product_id",
        productName: { $first: "$items.product_name" },
        totalQuantitySold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.subtotal" }
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    {
      $unwind: { path: "$product", preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        productName: 1,
        totalQuantitySold: 1,
        totalRevenue: 1,
        currentStock: "$product.stock_quantity",
        productImage: { $arrayElemAt: ["$product.images", 0] }
      }
    },
    {
      $sort: { totalQuantitySold: -1 }
    },
    {
      $limit: parseInt(limit as string)
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, topProducts, "Top selling products fetched successfully")
  );
});

// Get customer analytics
export const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { period = "30" } = req.query;
  
  const daysAgo = parseInt(period as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const [
    newCustomers,
    activeCustomers,
    topCustomers
  ] = await Promise.all([
    // New customers in period
    User.countDocuments({
      role: "customer",
      createdAt: { $gte: startDate }
    }),
    
    // Active customers (who placed orders in period)
    Order.distinct("user_id", {
      createdAt: { $gte: startDate }
    }).then(userIds => userIds.length),
    
    // Top customers by order value
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $in: ["delivered", "shipped", "confirmed"] }
        }
      },
      {
        $group: {
          _id: "$user_id",
          totalSpent: { $sum: "$final_amount" },
          totalOrders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          userName: "$user.name",
          userEmail: "$user.email",
          totalSpent: 1,
          totalOrders: 1,
          averageOrderValue: { $divide: ["$totalSpent", "$totalOrders"] }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 10
      }
    ])
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      newCustomers,
      activeCustomers,
      topCustomers
    }, "Customer analytics fetched successfully")
  );
});

// Get inventory alerts
export const getInventoryAlerts = asyncHandler(async (req, res) => {
  const { threshold = 10 } = req.query;

  const [
    lowStockProducts,
    outOfStockProducts
  ] = await Promise.all([
    Product.find({
      stock_quantity: { $lte: parseInt(threshold as string), $gt: 0 },
      status: "active"
    })
      .populate("category_id", "name")
      .select("name sku stock_quantity category_id images")
      .sort({ stock_quantity: 1 }),
    
    Product.find({
      stock_quantity: 0,
      status: "active"
    })
      .populate("category_id", "name")
      .select("name sku stock_quantity category_id images")
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      lowStockProducts,
      outOfStockProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length
    }, "Inventory alerts fetched successfully")
  );
});

// Get order status distribution
export const getOrderStatusDistribution = asyncHandler(async (req, res) => {
  const { period = "30" } = req.query;
  
  const daysAgo = parseInt(period as string);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const statusDistribution = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalValue: { $sum: "$final_amount" }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, statusDistribution, "Order status distribution fetched successfully")
  );
});

// Get recent activities
export const getRecentActivities = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  const [
    recentOrders,
    recentCustomers,
    recentProducts
  ] = await Promise.all([
    Order.find()
      .populate("user_id", "name email")
      .select("order_number status final_amount createdAt user_id")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string) / 3),
    
    User.find({ role: "customer" })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string) / 3),
    
    Product.find()
      .populate("category_id", "name")
      .select("name category_id createdAt")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string) / 3)
  ]);

  // Combine and sort all activities
  const activities = [
    ...recentOrders.map(order => ({
      type: "order",
      title: `New order ${order.order_number}`,
      description: `Order placed by ${(order.user_id as any).name}`,
      amount: order.final_amount,
      timestamp: (order as any).createdAt
    })),
    ...recentCustomers.map(customer => ({
      type: "customer",
      title: "New customer registered",
      description: `${customer.name} joined`,
      timestamp: (customer as any).createdAt
    })),
    ...recentProducts.map(product => ({
      type: "product",
      title: "New product added",
      description: `${product.name} in ${(product.category_id as any).name}`,
      timestamp: (product as any).createdAt
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, parseInt(limit as string));

  return res.status(200).json(
    new ApiResponse(200, activities, "Recent activities fetched successfully")
  );
});