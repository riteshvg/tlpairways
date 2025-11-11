import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

/**
 * A reusable Adobe Target content region wrapper that stays hidden until
 * Target injects content into the slot. Ideal for XT/AT activities.
 */
const TargetContentSlot = ({
  id,
  region,
  className = '',
  sx = {},
  children = null,
}) => {
  const containerRef = useRef(null);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const slot = container.querySelector('.target-injected-content');
    if (!slot) return;

    const evaluateContent = () => {
      const content = slot.innerHTML?.trim();
      const visible = Boolean(content && content.length > 0);
      setHasContent(visible);
    };

    evaluateContent();

    const observer = new MutationObserver(evaluateContent);
    observer.observe(slot, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  const combinedClassName = [
    'personalization-container',
    'target-content-slot',
    hasContent ? 'target-content-slot--visible' : 'target-content-slot--hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Box
      ref={containerRef}
      id={id}
      className={combinedClassName}
      data-at-region={region}
      sx={{
        display: hasContent ? 'block' : 'none',
        ...sx,
      }}
    >
      <div className="target-injected-content" />
      {children}
    </Box>
  );
};

TargetContentSlot.propTypes = {
  id: PropTypes.string.isRequired,
  region: PropTypes.string.isRequired,
  className: PropTypes.string,
  sx: PropTypes.object,
  children: PropTypes.node,
};

export default TargetContentSlot;

