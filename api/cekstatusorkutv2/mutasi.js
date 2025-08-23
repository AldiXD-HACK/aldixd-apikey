const axios = require('axios');
const https = require('https');
const { URL } = require('url');

// Configuration
const ORDERKUOTA_HOST = 'app.orderkuota.com';
const ORDERKUOTA_PORT = 443;
const MUTASI_PATH = '/api/v2';
const TIMEOUT = 5000; // 5 seconds timeout

module.exports = function (app) {

  // COMBINED CONNECTIVITY CHECK + MUTASI DATA
  app.get('/mutasiqris', async (req, res) => {
    const { username, token } = req.query;
    const results = {
      connectivity: {},
      mutasi: {}
    };

    // 1. Connectivity Check
    try {
      const startTime = Date.now();
      
      await new Promise((resolve, reject) => {
        const socket = require('net').Socket();
        socket.connect(ORDERKUOTA_PORT, ORDERKUOTA_HOST, resolve);
        socket.on('error', reject);
        socket.setTimeout(TIMEOUT, () => {
          socket.destroy();
          reject(new Error('Connection timeout'));
        });
      });

      results.connectivity = {
        status: true,
        message: `✅ Connected to ${ORDERKUOTA_HOST}:${ORDERKUOTA_PORT}`,
        response_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    } catch (connectError) {
      results.connectivity = {
        status: false,
        error: `❌ Failed to connect to ${ORDERKUOTA_HOST}:${ORDERKUOTA_PORT}`,
        details: connectError.message,
        timestamp: new Date().toISOString()
      };
      
      // If connection fails, don't proceed to mutasi request
      return res.status(500).json(results);
    }

    // 2. Mutasi Data Retrieval (only if connectivity succeeded)
    if (!username || !token) {
      results.mutasi = {
        status: false,
        error: 'Missing parameters for mutasi: username, token'
      };
      return res.status(400).json(results);
    }

    try {
      const mutasiUrl = new URL(MUTASI_PATH, `https://${ORDERKUOTA_HOST}`);
      mutasiUrl.searchParams.append('username', username);
      mutasiUrl.searchParams.append('token', token);

      const mutasiResponse = await axios.get(mutasiUrl.toString(), {
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      // Format mutasi data
      const formattedData = mutasiResponse.data.qris_history?.results?.map(item => ({
        id: item.id,
        date: item.tanggal,
        amount: item.kredit !== "0" ? item.kredit : item.debet,
        type: item.status === "IN" ? "CREDIT" : "DEBIT",
        final_balance: item.saldo_akhir,
        description: item.keterangan,
        fee: item.fee,
        brand: {
          name: item.brand?.name,
          logo: item.brand?.logo
        }
      })) || [];

      results.mutasi = {
        status: true,
        message: 'Mutasi data retrieved successfully',
        total_transactions: mutasiResponse.data.qris_history?.total || 0,
        transactions: formattedData,
        timestamp: new Date().toISOString()
      };

      return res.status(200).json(results);

    } catch (mutasiError) {
      let errorMessage = 'Mutasi request failed';
      let errorDetails = mutasiError.message;
      let statusCode = 500;

      if (mutasiError.response) {
        statusCode = mutasiError.response.status;
        errorDetails = mutasiError.response.data;
      } else if (mutasiError.request) {
        errorMessage = 'No response received from Mutasi API';
      }

      results.mutasi = {
        status: false,
        error: errorMessage,
        details: errorDetails,
        status_code: statusCode,
        timestamp: new Date().toISOString()
      };

      return res.status(statusCode).json(results);
    }
  });
};
