import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  useTheme,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const footerLinks = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Safety Information', href: '/safety' },
      { label: 'Cancellation Policy', href: '/cancellation' },
      { label: 'FAQs', href: '/faqs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Accessibility', href: '/accessibility' },
    ],
  },
];

const Footer = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Playfair Display',
                fontWeight: 600,
                mb: 2,
              }}
            >
              TLAirways
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your trusted partner for premium air travel experiences. We connect
              you to destinations worldwide with comfort and style.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton
                color="inherit"
                aria-label="Facebook"
                component="a"
                href="https://facebook.com"
                target="_blank"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Twitter"
                component="a"
                href="https://twitter.com"
                target="_blank"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="Instagram"
                component="a"
                href="https://instagram.com"
                target="_blank"
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                color="inherit"
                aria-label="LinkedIn"
                component="a"
                href="https://linkedin.com"
                target="_blank"
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
          {footerLinks.map((section) => (
            <Grid item xs={12} sm={6} md={2} key={section.title}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Playfair Display',
                  fontWeight: 600,
                  mb: 2,
                }}
              >
                {section.title}
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                {section.links.map((link) => (
                  <Box
                    component="li"
                    key={link.label}
                    sx={{ mb: 1 }}
                  >
                    <Link
                      href={link.href}
                      color="inherit"
                      underline="hover"
                      sx={{
                        '&:hover': {
                          color: 'secondary.main',
                        },
                      }}
                    >
                      {link.label}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            mt: 4,
            pt: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="inherit">
            © {new Date().getFullYear()} TLAirways. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 