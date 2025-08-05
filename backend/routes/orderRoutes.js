const express = require("express");
const router = express.Router();
const orderController = require("../order/orderController"); 
const { isAuthenticated, isAdmin } = require("../middleware/authCheck");

// ROUTE LOGIN USER
router.post("/create-orders", isAuthenticated, orderController.createOrders);
router.get("/", isAuthenticated, orderController.getUserOrders);
router.get("/user/history/:user_id", isAuthenticated, orderController.getUserOrderHistory);
router.post('/cancel/:orderId', isAuthenticated, orderController.cancelOrder);
router.get('/orders/:id', orderController.getOrderById);

// ROUTE ADMIN
router.get("/admin/orders", isAdmin, orderController.getAllOrders);
router.put("/admin/orders/:id", isAdmin, orderController.updateOrderStatus);
router.get("/admin/orders/html", isAdmin, orderController.renderAdminOrderHTML);

module.exports = router;