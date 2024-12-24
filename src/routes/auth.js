const express = require('express');
const { auth, db } = require('../config/firebase'); // Firebase bağlantısı
const router = express.Router();


// Kullanıcı Kaydı
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Firebase Authentication'da kullanıcı oluştur
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Firestore'da kullanıcı için belge oluştur
    await db.collection('users').doc(userRecord.uid).set({
      name: name,
      email: email,
      role: 'pending', // Varsayılan rol
      createdAt: new Date().toISOString(), // Tarihi manuel olarak ekliyoruz
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
      },
    });
  } catch (error) {
    console.error('Error during registration:', error);
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
    // Kullanıcıyı email ile al
    const user = await auth.getUserByEmail(email);

    // Kullanıcı için özel bir token oluştur
    const token = await auth.createCustomToken(user.uid);

    res.status(200).json({
      message: 'Login successful',
      token: token, // Token'ı yanıtın bir parçası olarak ekle
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(401).json({ message: 'Login failed', error: error.message });
  }
});

// Kullanıcı Rol Güncelleme
router.post('/update-role', async (req, res) => {
  const { uid, role } = req.body;

  try {
    if (!uid || !role) {
      return res.status(400).json({ message: 'UID and role are required' });
    }

    // Firestore'daki kullanıcı belgesini güncelle
    await db.collection('users').doc(uid).update({ role });

    res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(400).json({ message: 'Failed to update role', error: error.message });
  }
});

// Kullanıcı Bilgisi Getirme
router.get('/user/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: userDoc.data() });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(400).json({ message: 'Failed to fetch user data', error: error.message });
  }
});

// Token Doğrulama
router.post('/verify-token', async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await auth.verifyIdToken(token);
    res.status(200).json({ message: 'Token verified', user: decodedToken });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ message: 'Token verification failed', error: error.message });
  }
});

module.exports = router;
