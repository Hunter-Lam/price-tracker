import React, { useState } from 'react';
import { Modal, Input, Button, Space, Alert, Descriptions } from 'antd';
import { useTranslation } from 'react-i18next';
import { parseProductInfo } from '../utils/productInfoParser';

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
  const [parseResult, setParseResult] = useState<any>(null);

  const handleParse = () => {
    if (!inputText.trim()) {
      setParseError(t('pasteParser.inputRequired'));
      return;
    }

    try {
      const result = parseProductInfo(inputText);

      if (result.success && result.data) {
        setParseResult(result.data);
        setParseError(null);

        // Set warnings if any
        if (result.warnings && result.warnings.length > 0) {
          setParseWarning(result.warnings.join(', '));
        } else {
          setParseWarning(null);
        }
      } else {
        setParseError(result.error || t('pasteParser.noValidInfo'));
        setParseResult(null);
        setParseWarning(null);
      }
    } catch (error) {
      console.error('Parse error:', error);
      setParseError(t('pasteParser.parseError'));
      setParseResult(null);
      setParseWarning(null);
    }
  };

  const handleApplyToForm = () => {
    if (parseResult) {
      onParse(parseResult);
      handleClose();
    }
  };

  const handleClose = () => {
    setInputText('');
    setParseError(null);
    setParseWarning(null);
    setParseResult(null);
    onCancel();
  };

  return (
    <Modal
      title={t('pasteParser.title')}
      open={open}
      onCancel={handleClose}
      width={800}
      footer={[
        <Button key="clear" onClick={() => {
          setInputText('');
          setParseError(null);
          setParseWarning(null);
          setParseResult(null);
        }}>
          {t('pasteParser.clear')}
        </Button>,
        <Button key="cancel" onClick={handleClose}>
          {t('pasteParser.cancel')}
        </Button>,
        parseResult ? (
          <Button key="apply" type="primary" onClick={handleApplyToForm}>
            {t('pasteParser.applyToForm')}
          </Button>
        ) : (
          <Button key="parse" type="primary" onClick={handleParse}>
            {t('pasteParser.parseButton')}
          </Button>
        ),
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

        {parseResult ? (
          <Alert
            message={t('pasteParser.parseSuccess')}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {parseResult ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label={t('form.productTitle')}>
              {parseResult.title || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('form.brand')}>
              {parseResult.brand || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('form.finalPrice')}>
              {parseResult.price ? `¥${parseResult.price}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('form.originalPrice')}>
              {parseResult.originalPrice ? `¥${parseResult.originalPrice}` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('form.specification')}>
              {parseResult.specification || '-'}
            </Descriptions.Item>
            <Descriptions.Item label={t('source.productSource')}>
              {parseResult.source?.address || '-'}
            </Descriptions.Item>
            {parseResult.discount && parseResult.discount.length > 0 && (
              <Descriptions.Item label={t('discount.title')}>
                {parseResult.discount.map((d: any, idx: number) => (
                  <div key={idx}>
                    {d.discountOwner} - {d.discountType}: {d.discountValue}
                  </div>
                ))}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <>
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
          </>
        )}
      </Space>
    </Modal>
  );
};
