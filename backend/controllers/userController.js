const { users } = require('@clerk/clerk-sdk-node');

const getUserDetails = async (req, res) => {
  try {
    const user = await users.getUser(req.params.id);

    const userData = {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      imageUrl: user.imageUrl,
      phoneNumber: user.phoneNumbers?.[0]?.phoneNumber || 'Not provided'
    };

    res.json(userData);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
};

module.exports = { getUserDetails };