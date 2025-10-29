/**
 * JD Specification Importer Component
 * Allows importing product specifications from JD.com HTML
 */

import React, { useState } from 'react';
import { Button, Modal, Input, Space, Descriptions, Alert, App } from 'antd';
import { FileTextOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { parseJDProductInfo, type JDProductInfo } from '../utils/JDSpecParser';

const { TextArea } = Input;

interface JDSpecImporterProps {
  onImport: (specification: string) => void;
}

export const JDSpecImporter: React.FC<JDSpecImporterProps> = ({ onImport }) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [html, setHtml] = useState('');
  const [parsedData, setParsedData] = useState<JDProductInfo | null>(null);

  const handleParse = () => {
    if (!html.trim()) {
      message.warning(t('jdSpecImporter.parseWarning'));
      return;
    }

    try {
      const productInfo = parseJDProductInfo(html);
      const hasSpecifications = Object.keys(productInfo.specifications).length > 0;

      if (!hasSpecifications) {
        message.error(t('jdSpecImporter.parseError'));
        return;
      }

      setParsedData(productInfo);
      message.success(t('jdSpecImporter.parseSuccess'));
    } catch (error) {
      console.error('Parse error:', error);
      message.error(t('jdSpecImporter.parseError'));
    }
  };

  const handleApply = () => {
    if (!parsedData) {
      message.warning(t('jdSpecImporter.parseWarning'));
      return;
    }

    // Format specifications with line breaks for better readability
    const specification = Object.entries(parsedData.specifications)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    onImport(specification);
    message.success(t('jdSpecImporter.importSuccess'));

    // Close modal and reset state
    setIsModalOpen(false);
    setHtml('');
    setParsedData(null);
  };

  const handleClear = () => {
    setHtml('');
    setParsedData(null);
  };

  return (
    <>
      <Button
        type="link"
        size="small"
        icon={<FileTextOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={{ padding: '0 4px', height: 'auto' }}
      >
        {t('jdSpecImporter.button')}
      </Button>

      <Modal
        title={t('jdSpecImporter.title')}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message={t('jdSpecImporter.instructions')}
            description={
              <ol style={{ paddingLeft: 20, margin: '8px 0 0 0' }}>
                <li>{t('jdSpecImporter.step1')}</li>
                <li>{t('jdSpecImporter.step2')}</li>
                <li>{t('jdSpecImporter.step3')}</li>
                <li>{t('jdSpecImporter.step4')}</li>
                <li>{t('jdSpecImporter.step5')}</li>
              </ol>
            }
            type="info"
            icon={<InfoCircleOutlined />}
            showIcon
          />

          <TextArea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder={t('jdSpecImporter.placeholder')}
            rows={6}
            autoSize={{ minRows: 6, maxRows: 12 }}
          />

          <Space>
            <Button
              type="primary"
              onClick={handleParse}
              disabled={!html.trim()}
            >
              {t('jdSpecImporter.parseButton')}
            </Button>
            <Button onClick={handleClear}>
              {t('jdSpecImporter.clear')}
            </Button>
          </Space>

          {parsedData && (
            <div style={{
              marginTop: 16,
              padding: 16,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              backgroundColor: '#fafafa'
            }}>
              <div style={{ marginBottom: 12 }}>
                <strong>{t('jdSpecImporter.specifications')}:</strong>
              </div>

              <Descriptions column={2} size="small" bordered>
                {Object.entries(parsedData.specifications).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {value as string}
                  </Descriptions.Item>
                ))}
              </Descriptions>

              <Button
                type="primary"
                onClick={handleApply}
                style={{ marginTop: 16, width: '100%' }}
              >
                {t('jdSpecImporter.applyToForm')}
              </Button>
            </div>
          )}
        </Space>
      </Modal>
    </>
  );
};
