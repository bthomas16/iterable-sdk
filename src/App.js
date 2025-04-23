import { useEffect, useState } from 'react';
import {
  initializeWithConfig,
  updateUser,
  track,
  getInAppMessages,
  IterableEmbeddedManager
} from '@iterable/web-sdk';
import {
  Container,
  Typography,
  Button,
  CssBaseline,
  Box,
  Paper,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function App() {
  const [iterableInitialized, setIterableInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inAppHtml, setInAppHtml] = useState(null);
  const [embeddedMessage, setEmbeddedMessage] = useState(null);
  const [embeddedManager, setEmbeddedManager] = useState(null);


  useEffect(() => {
    const initIterable = async () => {
      const jwt_token = process.env.JWT_TOKEN

      try {
        const sdk = await initializeWithConfig({
          authToken: process.env.API_KEY,
          configOptions: {},
          generateJWT: () => Promise.resolve(jwt_token)
        });

        // complete sdk intialization
        await sdk.setEmail(process.env.EMAIL);

        // Show green initialized box
        setIterableInitialized(true);

        // prepare embedded manager
        const embedded = new IterableEmbeddedManager('sa-js-challenge');
        setEmbeddedManager(embedded);
      } catch (error) {
        console.error('Iterable init failed:', error);
      } finally {
        setLoading(false);
      }
    };

    initIterable();
  }, []);

  // BUTON HANDLERS

  const handleUpdateUser = async () => {
    if (iterableInitialized && !loading) {
      try {
        await updateUser({dataFields: {
          firstName: 'Brent',
          isWebUser: true,
          SA_WebUser_Test_Key: 'completed'
          }
        });
        alert('User profile updated!');
      } catch (error) {
        console.error('Failed to update user:', error);
      }
    }
  };

  const handleGetInAppMessage = async () => {
    try {
      const { request } = getInAppMessages(
        {
          count: 1,
          packageName: 'sa-js-challenge',
          displayInterval: 3000
        },
        { display: 'none' } // Prevent auto-rendering
      );
  
      const messages = await request();
      if (messages && messages.length > 0) {
        const message = messages[0];
        setInAppHtml(message.content.html); // Store HTML
      } else {
        alert('No in-app messages found');
      }
    } catch (error) {
      console.error('Failed to get in-app message:', error);
    }
  };

  const handleTrackCustomEvent = async () => {
      try {
        await track(
          {
            eventName: "webSATestEvent",
            dataFields: {
              platform: "web",
              isTestEvent: true,
              url: "https://iterable.com/sa-test/Brent",
              secret_code_key: "Code_2022"
            }
          }
        );
        alert('Tracked custom event!');
      } catch (error) {
        console.error('Failed to track custom event:', error);
      }
  };

  const handleLoadEmbeddedMessage = async () => {
    if (!embeddedManager) return;
  
    try {
      await embeddedManager.syncMessages('sa-js-challenge', () => {
        const messages = embeddedManager.getMessages();
  
        if (messages.length > 0) {
          setEmbeddedMessage(messages[0]);
        } else {
          alert('No embedded messages found.');
        }
      });
    } catch (err) {
      console.error('Error loading embedded messages:', err);
    }
  };
  
  
// Render the embedded message component (within main component)
  const renderEmbeddedMessage = (message) => {
    if (!message || !message.elements) return null;
  
    const {
      title,
      body,
      mediaUrl,
      buttons
    } = message.elements;
  
    const {
      bg_color,
      button1_bg_color,
      button1_text_color,
      button2_text_color
    } = message.payload || {};
  
    return (
      <Box
        sx={{
          backgroundColor: bg_color || '#fff',
          borderRadius: 2,
          p: 3,
          mt: 2,
          textAlign: 'center',
          boxShadow: 2
        }}
      >
        {mediaUrl && (
          <img
            src={mediaUrl}
            alt="Embedded"
            style={{ maxWidth: '100%', borderRadius: '8px' }}
          />
        )}
        <Typography variant="h6" mt={2}>
          {title}
        </Typography>
        <Typography variant="body1" mt={1} mb={2}>
          {body}
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          {buttons?.map((btn, index) => (
            <Button
              key={btn.id}
              variant="contained"
              sx={{
                backgroundColor:
                  index === 0 ? button1_bg_color || 'primary.main' : '#eee',
                color:
                  index === 0 ? button1_text_color || '#fff' : button2_text_color || '#000'
              }}
              onClick={() => {
                if (btn.action.type === 'dismiss') {
                  setEmbeddedMessage(null);
                } else {
                  alert(`Clicked: ${btn.title}`);
                }
              }}
            >
              {btn.title}
            </Button>
          ))}
        </Stack>
      </Box>
    );
  };
  

  // Render the main component
  return (
    <>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ mt: 6, position: 'relative' }}>
         
          <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
            <Typography variant="h4" gutterBottom align="center">
              Iterable SDK Demo
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary">
              React + Material UI + JWT Auth
            </Typography>

            <Box mt={4}>
              {loading ? (
                <Stack alignItems="center">
                  <CircularProgress />
                  <Typography mt={2}>Initializing Iterable...</Typography>
                </Stack>
              ) : iterableInitialized ? (
                <Alert severity="success" icon={<CheckCircleIcon />}>
                  Iterable SDK Initialized Successfully
                </Alert>
              ) : (
                <Alert severity="error">
                  Failed to initialize Iterable SDK. Check your JWT and config.
                </Alert>
              )}
            </Box>

            <Stack spacing={2} mt={4}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleUpdateUser}
                disabled={!iterableInitialized}
              >
                Update User Profile
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleTrackCustomEvent}
                color='common'
                disabled={!iterableInitialized}
              >
                Track Custom Event
              </Button>


              <Button
                variant="outlined"
                fullWidth
                onClick={handleGetInAppMessage}
                color='tertiary'
                disabled={!iterableInitialized}>
                Load In-App Message HTML
              </Button>


              <Button
                variant="contained"
                fullWidth
                onClick={handleLoadEmbeddedMessage}
                color='secondary'
                disabled={!iterableInitialized}
              >
                Load Embedded Message
              </Button>
            </Stack>

            {/* Message will render here */}
            <Box
              sx={{
                mt: 4,
                p: 2,
                border: '1px solid #ccc',
                borderRadius: 2,
                backgroundColor: '#fefefe',
                minHeight: 100
              }}
            >
              {embeddedMessage ? (
                renderEmbeddedMessage(embeddedMessage)
              ) : (
                <Typography variant="subtitle2" color="text.secondary">
                  Embedded message will render here
                </Typography>
              )}
            </Box>


            {inAppHtml && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  In-App Message:
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    padding: 2,
                    overflow: 'auto',
                    maxHeight: 400
                  }}
                  dangerouslySetInnerHTML={{ __html: inAppHtml }}
                />
              </Box>
            )}


          </Paper>
        </Box>
      </Container>
    </>
  );
}
