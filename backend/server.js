const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./database');

const router = express.Router();

// Middleware
router.use(cors());
router.use(express.json());

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Sun sign determination based on birthday
const determineSunSign = (birthday) => {
  const date = new Date(birthday);
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  // Define sun sign date ranges
  const sunSigns = {
    'Aries': { startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
    'Taurus': { startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
    'Gemini': { startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
    'Cancer': { startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
    'Leo': { startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
    'Virgo': { startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
    'Libra': { startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
    'Scorpio': { startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
    'Sagittarius': { startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
    'Capricorn': { startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
    'Aquarius': { startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
    'Pisces': { startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 }
  };
  
  // Find matching sun sign
  for (const [sign, range] of Object.entries(sunSigns)) {
    if (
      (month === range.startMonth && day >= range.startDay) ||
      (month === range.endMonth && day <= range.endDay)
    ) {
      return sign;
    }
  }
  
  // Default fallback (should not reach here if all dates are covered)
  return 'Unknown';
};

// Random human design type assignment
const getRandomHumanDesignType = () => {
  const types = ['Generator', 'Projector', 'Manifestor', 'Reflector'];
  const randomIndex = Math.floor(Math.random() * types.length);
  return types[randomIndex];
};

// Predefined chatbot responses based on sun sign and human design type
const getChatbotResponse = (sunSign, hdType) => {
  const responses = {
    // Fire signs
    'Aries': {
      'Generator': "As an Aries Generator, your fiery energy is best channeled when responding to life's challenges. Wait for opportunities that excite you before taking action.",
      'Projector': "As an Aries Projector, your natural leadership can shine when you're invited. Be patient and use your fiery insight to guide others.",
      'Manifestor': "As an Aries Manifestor, you're a powerful initiator. Channel your fiery energy wisely and inform others before making big moves.",
      'Reflector': "As an Aries Reflector, you reflect the fiery energy around you. Take your time (a full lunar cycle) before making important decisions."
    },
    'Leo': {
      'Generator': "As a Leo Generator, your creative energy thrives when you respond to what lights your heart on fire. Follow your sacral response.",
      'Projector': "As a Leo Projector, your ability to guide others shines when you're recognized. Wait for the right invitation to share your creative gifts.",
      'Manifestor': "As a Leo Manifestor, you're designed to initiate creative projects. Remember to inform others before making big moves to avoid resistance.",
      'Reflector': "As a Leo Reflector, you mirror the creative energy around you. Give yourself time to process before making important decisions."
    },
    'Sagittarius': {
      'Generator': "As a Sagittarius Generator, your quest for knowledge and adventure is best guided by your sacral response. Wait for what truly excites you.",
      'Projector': "As a Sagittarius Projector, your visionary wisdom is best shared when invited. Wait for recognition before offering your expansive perspective.",
      'Manifestor': "As a Sagittarius Manifestor, your adventurous spirit needs freedom to initiate. Remember to inform others of your plans to maintain harmony.",
      'Reflector': "As a Sagittarius Reflector, you sample the adventurous energy around you. Give yourself a full lunar cycle before committing to major journeys."
    },
    
    // Earth signs
    'Taurus': {
      'Generator': "As a Taurus Generator, your earthy stability brings consistent value when you respond to what feels right. Trust your body's signals.",
      'Projector': "As a Taurus Projector, your practical guidance is valuable when recognized. Wait for invitation before offering your grounded wisdom.",
      'Manifestor': "As a Taurus Manifestor, you can initiate stable, valuable projects. Inform others before making moves to ensure smooth implementation.",
      'Reflector': "As a Taurus Reflector, you sense the grounded energy around you. Take your time (a full lunar cycle) before making material decisions."
    },
    'Virgo': {
      'Generator': "As a Virgo Generator, your detail-oriented energy is best utilized when responding to what truly feels right. Wait for the correct opportunity.",
      'Projector': "As a Virgo Projector, your analytical mind can guide others when recognized. Wait for invitation before offering your practical solutions.",
      'Manifestor': "As a Virgo Manifestor, your precise plans can create excellent systems. Remember to inform others before implementing your detailed ideas.",
      'Reflector': "As a Virgo Reflector, you absorb the analytical energy around you. Take a full lunar cycle before finalizing important analytical decisions."
    },
    'Capricorn': {
      'Generator': "As a Capricorn Generator, your ambitious energy finds success when responding to genuine opportunities. Trust your gut reaction.",
      'Projector': "As a Capricorn Projector, your structural wisdom is powerful when recognized. Wait for the right invitation to share your strategic insights.",
      'Manifestor': "As a Capricorn Manifestor, you're built to initiate organized systems. Inform others before making big moves to ensure cooperation.",
      'Reflector': "As a Capricorn Reflector, you sense the ambitious energy around you. Take a full lunar cycle before committing to major career decisions."
    },
    
    // Air signs
    'Gemini': {
      'Generator': "As a Gemini Generator, your curious energy flows best when responding to intellectual stimulation. Follow what genuinely excites you.",
      'Projector': "As a Gemini Projector, your communication skills shine when recognized. Wait for invitation before sharing your diverse knowledge.",
      'Manifestor': "As a Gemini Manifestor, you're designed to initiate conversations and connections. Inform others before launching new communication channels.",
      'Reflector': "As a Gemini Reflector, you sample the communicative energy around you. Take a full lunar cycle before making decisions about important connections."
    },
    'Libra': {
      'Generator': "As a Libra Generator, your harmonious energy works best when responding to balanced opportunities. Trust your body's signals about relationships.",
      'Projector': "As a Libra Projector, your diplomatic abilities are valuable when recognized. Wait for invitation before offering your balanced perspective.",
      'Manifestor': "As a Libra Manifestor, you can initiate harmonious connections. Remember to inform others before making relationship moves.",
      'Reflector': "As a Libra Reflector, you sense the relational energy around you. Take a full lunar cycle before making important partnership decisions."
    },
    'Aquarius': {
      'Generator': "As an Aquarius Generator, your innovative energy thrives when responding to what genuinely excites your originality. Trust your unique response.",
      'Projector': "As an Aquarius Projector, your visionary perspective is powerful when recognized. Wait for invitation before sharing your revolutionary ideas.",
      'Manifestor': "As an Aquarius Manifestor, you're built to initiate progressive change. Inform others before launching your innovative projects.",
      'Reflector': "As an Aquarius Reflector, you sample the revolutionary energy around you. Take a full lunar cycle before committing to social causes."
    },
    
    // Water signs
    'Cancer': {
      'Generator': "As a Cancer Generator, your nurturing energy flows best when responding to emotional connections. Trust your intuitive signals.",
      'Projector': "As a Cancer Projector, your emotional wisdom guides others when recognized. Wait for invitation before offering your nurturing support.",
      'Manifestor': "As a Cancer Manifestor, you can initiate supportive environments. Remember to inform others before making emotional or home-related moves.",
      'Reflector': "As a Cancer Reflector, you sense the nurturing energy around you. Take a full lunar cycle before making important family decisions."
    },
    'Scorpio': {
      'Generator': "As a Scorpio Generator, your transformative energy is powerful when responding to deep connections. Trust your intense gut reactions.",
      'Projector': "As a Scorpio Projector, your penetrating insights are valuable when recognized. Wait for invitation before sharing your transformative wisdom.",
      'Manifestor': "As a Scorpio Manifestor, you're designed to initiate powerful change. Inform others before making moves that impact shared resources.",
      'Reflector': "As a Scorpio Reflector, you sample the transformative energy around you. Take a full lunar cycle before committing to major life changes."
    },
    'Pisces': {
      'Generator': "As a Pisces Generator, your intuitive energy flows best when responding to spiritual connections. Follow what genuinely moves your soul.",
      'Projector': "As a Pisces Projector, your spiritual wisdom guides others when recognized. Wait for invitation before sharing your compassionate vision.",
      'Manifestor': "As a Pisces Manifestor, you can initiate creative and spiritual projects. Remember to inform others before diving into new mystical waters.",
      'Reflector': "As a Pisces Reflector, you absorb the spiritual energy around you. Take a full lunar cycle before making decisions about your intuitive path."
    }
  };
  
  // Return the specific response based on sun sign and human design type
  // If not found, return a generic response
  return responses[sunSign]?.[hdType] || 
    `As a ${sunSign} ${hdType}, you blend ${sunSign}'s traits with ${hdType} energy. Trust your design's wisdom.`;
};

// Mock geocoding function (for MVP)
const getCoordinates = async (place) => {
  // For production, you would replace this with actual API call:
  // const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  // const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${apiKey}`);
  
  // Return mock coordinates for MVP
  console.log(`Mock geocoding for: ${place}`);
  return { lat: Math.random() * 180 - 90, lng: Math.random() * 360 - 180 };
};

// User data endpoint
router.post('/user', async (req, res) => {
  try {
    const { name, birthday, birthplace, jobTitle } = req.body;
    
    // Input validation
    if (!name || !birthday || !birthplace || !jobTitle) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate date format (basic check)
    const birthdayDate = new Date(birthday);
    if (isNaN(birthdayDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Determine sun sign based on birthday
    const sunSign = determineSunSign(birthday);
    
    // Random human design type for MVP
    const hdType = getRandomHumanDesignType();
    
    // Get chatbot response based on sun sign and human design type
    const chatResponse = getChatbotResponse(sunSign, hdType);
    
    // Get coordinates from place (mock for MVP)
    const { lat, lng } = await getCoordinates(birthplace);
    
    // Save user data to database
    const stmt = db.prepare(`
      INSERT INTO users (name, birthday, birthplace, job_title, sun_sign, hd_type, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(name, birthday, birthplace, jobTitle, sunSign, hdType, lat, lng, function(err) {
      if (err) {
        console.error('Error saving user data', err.message);
        return res.status(500).json({ message: 'Error saving user data' });
      }
      
      // Send response with user id and determined values
      res.status(201).json({
        userId: this.lastID,
        name,
        sunSign,
        hdType,
        chatResponse
      });
    });
    
    stmt.finalize();
    
  } catch (error) {
    console.error('Server error', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 