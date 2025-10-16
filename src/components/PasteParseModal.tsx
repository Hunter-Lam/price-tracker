import React, { useState } from 'react';
import { Modal, Input, Button, Space, Alert } from 'antd';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

interface PasteParseModalProps {
  open: boolean;
  onCancel: () => void;
  onParse: (parsedData: any) => void;
}

export const PasteParseModal: React.FC<PasteParseModalProps> = ({
  open,
  onCancel,
  onParse,
}) => {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseWarning, setParseWarning] = useState<string | null>(null);

  const handleParse = () => {
    if (!inputText.trim()) {
      setParseError(t('pasteParser.inputRequired'));
      return;
    }

    try {
      // TODO: Implement parser logic for different formats
      // For now, this is a placeholder
      const parsedData = parseProductInfo(inputText);

      if (parsedData) {
        onParse(parsedData);
        handleClose();
      } else {
        setParseError(t('pasteParser.noValidInfo'));
      }
    } catch (error) {
      console.error('Parse error:', error);
      setParseError(t('pasteParser.parseError'));
    }
  };

  const handleClose = () => {
    setInputText('');
    setParseError(null);
    setParseWarning(null);
    onCancel();
  };

  const parseProductInfo = (_text: string): any | null => {
    // Placeholder parser - will be implemented based on your formats
    // This is where we'll add logic to parse different product info formats

    return null; // Will be replaced with actual parsing logic
  };

  return (
    <Modal
      title={t('pasteParser.title')}
      open={open}
      onCancel={handleClose}
      width={700}
      footer={[
        <Button key="clear" onClick={() => {
          setInputText('');
          setParseError(null);
          setParseWarning(null);
        }}>
          {t('pasteParser.clear')}
        </Button>,
        <Button key="cancel" onClick={handleClose}>
          {t('pasteParser.cancel')}
        </Button>,
        <Button key="parse" type="primary" onClick={handleParse}>
          {t('pasteParser.parseButton')}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {parseError && (
          <Alert
            message={t('pasteParser.parseError')}
            description={parseError}
            type="error"
            showIcon
            closable
            onClose={() => setParseError(null)}
          />
        )}

        {parseWarning && (
          <Alert
            message={t('pasteParser.parseWarning')}
            description={parseWarning}
            type="warning"
            showIcon
            closable
            onClose={() => setParseWarning(null)}
          />
        )}

        <TextArea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('pasteParser.placeholder')}
          rows={12}
          style={{ fontFamily: 'monospace' }}
        />

        <Alert
          message={t('pasteParser.instructions')}
          description={t('pasteParser.instructionsDetail')}
          type="info"
          showIcon
        />
      </Space>
    </Modal>
  );
};
