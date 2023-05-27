const User = require('../models/user');
const Order = require('../models/order');

const createOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const { items, status, cartPrice } = req.body;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newOrder = new Order({
      user: userId,
      username: user.username,
      items: items,
      status: status,
      cartPrice: cartPrice,
    });

    const createdOrder = await newOrder.save();
    console.log('New order created:', createdOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const getOrdersOfUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  const userRole = user ? user.role : null;

  try {
    const orders = await getOrdersByUserId(userId, userRole);
    res.json(orders);
  } catch (error) {
    console.error('Error retrieving orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getOrdersByUserId = async (userId, userRole) => {
  try {
    let orders;

    if (userRole === 'staff') {
      orders = await Order.find();
    } else if (userRole === 'customer') {
      orders = await Order.find({ user: userId });
    } else {
      throw new Error('Invalid user role');
    }

    return orders;
  } catch (error) {
    console.error('Error retrieving orders:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  getOrdersOfUser,
};
