import React, { useState } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { GlobalOutlined, DownOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Quick switch to next language
  const handleQuickSwitch = () => {
    if (dropdownOpen) return; // Don't switch if dropdown is open

    const currentIndex = availableLanguages.findIndex(lang => lang.code === language);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    setLanguage(availableLanguages[nextIndex].code);
  };

  // Handle dropdown click on expand arrow
  const handleDropdownClick = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Dropdown menu items
  const menuItems = availableLanguages.map((lang) => ({
    key: lang.code,
    label: (
      <span style={{
        fontWeight: lang.code === language ? 'bold' : 'normal',
        color: lang.code === language ? '#1890ff' : undefined
      }}>
        {lang.name}
      </span>
    ),
    onClick: () => {
      setLanguage(lang.code);
      setDropdownOpen(false);
    }
  }));

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* Main button - click to switch language */}
      <Button
        type="text"
        icon={<GlobalOutlined />}
        onClick={handleQuickSwitch}
        title={t('language.quickSwitch')}
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          paddingRight: '8px'
        }}
      >
        <Space>
          {currentLanguage?.name}
        </Space>
      </Button>

      {/* Dropdown button - click to expand language options */}
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        open={dropdownOpen}
        onOpenChange={setDropdownOpen}
        trigger={['click']} // Auto hide when clicking outside
      >
        <Button
          type="text"
          icon={<DownOutlined />}
          onClick={handleDropdownClick}
          title={t('language.expandOptions')}
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            paddingLeft: '4px',
            paddingRight: '4px',
            minWidth: '24px',
            borderLeft: '1px solid rgba(0, 0, 0, 0.06)'
          }}
        />
      </Dropdown>
    </div>
  );
};

export default LanguageToggle;