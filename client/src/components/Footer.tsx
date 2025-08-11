import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const Footer: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        maxWidth: '300px'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <Text 
          style={{ 
            fontSize: '12px', 
            fontWeight: 500, 
            color: '#ffffff',
            lineHeight: '1.2',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}
        >
          Enkhmend Nergui
        </Text>
        <Text 
          style={{ 
            fontSize: '11px', 
            color: '#e3f2fd',
            lineHeight: '1.2',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}
        >
          nergui.eegii04@gmail.com
        </Text>
      </div>
    </div>
  );
};

export default Footer;
