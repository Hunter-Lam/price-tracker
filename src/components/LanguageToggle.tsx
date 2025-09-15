import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { t } = useTranslation();

  const menuItems = availableLanguages.map((lang) => ({
    key: lang.code,
    label: lang.name,
    onClick: () => setLanguage(lang.code)
  }));

  const currentLanguage = availableLanguages.find(lang => lang.code === language);

  return (
    <Dropdown 
      menu={{ items: menuItems }}
      placement="bottomRight"
      trigger={['click']}
    >
      <Button 
        type="text" 
        icon={<GlobalOutlined />}
        title={t('language.switch')}
      >
        <Space>
          {currentLanguage?.name}
        </Space>
      </Button>
    </Dropdown>
  );
};

export default LanguageToggle;