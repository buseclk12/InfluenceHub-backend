const express = require('express');
const { auth } = require('../config/firebase');
const router = express.Router();

// Kullanıcı Kaydı
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });
    res.status(201).json({ message: 'User registered successfully', user: userRecord });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// Kullanıcı Girişi
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      // Firebase oturumu başlatmak için özel bir işlem gerekebilir
      const user = await auth.getUserByEmail(email);
  
      // Token ID oluştur
      const token = await auth.createCustomToken(user.uid);
  
      res.status(200).json({
        message: 'Login successful',
        token: token, // Token'ı yanıtın bir parçası olarak ekle
      });
    } catch (error) {
      res.status(401).json({ message: 'Login failed', error: error.message });
    }
  });
  

// Token Doğrulama
router.post('/verify-token', async (req, res) => {
  const { token } = req.body;
  try {
    const decodedToken = await auth.verifyIdToken(token);
    res.status(200).json({ message: 'Token verified', user: decodedToken });
  } catch (error) {
    res.status(401).json({ message: 'Token verification failed', error: error.message });
  }
});

module.exports = router;
