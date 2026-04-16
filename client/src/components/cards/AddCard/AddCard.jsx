/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, Icon, TextArea } from 'semantic-ui-react';
import { useClickAwayListener, useDidUpdate, usePrevious, useToggle } from '../../../lib/hooks';
import { usePopup } from '../../../lib/popup';

import selectors from '../../../selectors';
import { useClosable, useForm, useNestedRef } from '../../../hooks';
import { isModifierKeyPressed } from '../../../utils/event-helpers';
import { CardTypeIcons } from '../../../constants/Icons';
import SelectCardTypeStep from '../SelectCardTypeStep';
import LabelsStep from '../../labels/LabelsStep';
import LabelChip from '../../labels/LabelChip';

import styles from './AddCard.module.scss';

const DEFAULT_DATA = {
  name: '',
  labelIds: [],
};

const AddCard = React.memo(({ isOpened, openOnCreate, className, onCreate, onClose }) => {
  const { defaultCardType: defaultType, limitCardTypesToDefaultOne: limitTypesToDefaultOne } =
    useSelector(selectors.selectCurrentBoard);

  const [t] = useTranslation();
  const prevDefaultType = usePrevious(defaultType);

  const [data, handleFieldChange, setData] = useForm(() => ({
    ...DEFAULT_DATA,
    type: defaultType,
  }));

  const [focusNameFieldState, focusNameField] = useToggle();
  const [isClosableActiveRef, activateClosable, deactivateClosable] = useClosable();

  const [nameFieldRef, handleNameFieldRef] = useNestedRef();
  const [submitButtonRef, handleSubmitButtonRef] = useNestedRef();
  const [selectTypeButtonRef, handleSelectTypeButtonRef] = useNestedRef();
  const [labelsButtonRef, handleLabelsButtonRef] = useNestedRef();

  const submit = useCallback(
    (autoOpen) => {
      const cleanData = {
        ...data,
        name: data.name.trim(),
      };

      if (!cleanData.name) {
        nameFieldRef.current.select();
        return;
      }

      onCreate(cleanData, autoOpen);

      setData({
        ...DEFAULT_DATA,
        type: defaultType,
      });

      if (autoOpen) {
        onClose();
      } else {
        focusNameField();
      }
    },
    [onCreate, onClose, defaultType, data, setData, focusNameField, nameFieldRef],
  );

  const handleSubmit = useCallback(() => {
    submit(openOnCreate);
  }, [openOnCreate, submit]);

  const handleTypeSelect = useCallback(
    (type) => {
      setData((prevData) => ({
        ...prevData,
        type,
      }));
    },
    [setData],
  );

  const handleLabelSelect = useCallback(
    (id) => {
      setData((prevData) => ({
        ...prevData,
        labelIds: [...prevData.labelIds, id],
      }));
    },
    [setData],
  );

  const handleLabelDeselect = useCallback(
    (id) => {
      setData((prevData) => ({
        ...prevData,
        labelIds: prevData.labelIds.filter((labelId) => labelId !== id),
      }));
    },
    [setData],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          submit(openOnCreate || isModifierKeyPressed(event));

          break;
        case 'Escape':
          onClose();

          break;
        default:
      }
    },
    [onClose, openOnCreate, submit],
  );

  const handleSelectTypeClose = useCallback(() => {
    deactivateClosable();
    nameFieldRef.current.focus();
  }, [deactivateClosable, nameFieldRef]);

  const handleLabelsClose = useCallback(() => {
    deactivateClosable();
    nameFieldRef.current.focus();
  }, [deactivateClosable, nameFieldRef]);

  const handleAwayClick = useCallback(() => {
    if (!isOpened || isClosableActiveRef.current) {
      return;
    }

    onClose();
  }, [isOpened, onClose, isClosableActiveRef]);

  const handleClickAwayCancel = useCallback(() => {
    nameFieldRef.current.focus();
  }, [nameFieldRef]);

  const clickAwayProps = useClickAwayListener(
    [nameFieldRef, submitButtonRef, selectTypeButtonRef, labelsButtonRef],
    handleAwayClick,
    handleClickAwayCancel,
  );

  useEffect(() => {
    if (isOpened) {
      nameFieldRef.current.focus();
    }
  }, [isOpened, nameFieldRef]);

  useEffect(() => {
    if (!isOpened && defaultType !== prevDefaultType) {
      setData((prevData) => ({
        ...prevData,
        type: defaultType,
      }));
    }
  }, [isOpened, defaultType, prevDefaultType, setData]);

  useDidUpdate(() => {
    nameFieldRef.current.focus();
  }, [focusNameFieldState]);

  const SelectCardTypePopup = usePopup(SelectCardTypeStep, {
    onOpen: activateClosable,
    onClose: handleSelectTypeClose,
  });

  const LabelsPopup = usePopup(LabelsStep, {
    onOpen: activateClosable,
    onClose: handleLabelsClose,
  });

  return (
    <Form
      className={classNames(className, !isOpened && styles.wrapperClosed)}
      onSubmit={handleSubmit}
    >
      <div className={styles.fieldWrapper}>
        <TextArea
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          ref={handleNameFieldRef}
          as={TextareaAutosize}
          name="name"
          value={data.name}
          placeholder={t('common.enterCardTitle')}
          maxLength={1024}
          minRows={3}
          className={styles.field}
          onKeyDown={handleFieldKeyDown}
          onChange={handleFieldChange}
        />
        {data.labelIds.length > 0 && (
          <div className={styles.labels}>
            {data.labelIds.map((labelId) => (
              <LabelChip key={labelId} id={labelId} size="small" />
            ))}
          </div>
        )}
      </div>
      <div className={styles.controls}>
        <Button
          {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
          positive
          ref={handleSubmitButtonRef}
          content={t('action.addCard')}
          className={styles.button}
        />
        <LabelsPopup currentIds={data.labelIds} onSelect={handleLabelSelect} onDeselect={handleLabelDeselect}>
          <Button
            {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
            ref={handleLabelsButtonRef}
            type="button"
            icon="tag"
            className={classNames(styles.button, styles.labelsButton)}
          />
        </LabelsPopup>
        <SelectCardTypePopup defaultValue={data.type} onSelect={handleTypeSelect}>
          <Button
            {...clickAwayProps} // eslint-disable-line react/jsx-props-no-spreading
            ref={handleSelectTypeButtonRef}
            type="button"
            disabled={limitTypesToDefaultOne}
            className={classNames(styles.button, styles.selectTypeButton)}
          >
            <Icon name={CardTypeIcons[data.type]} className={styles.selectTypeButtonIcon} />
            {t(`common.${data.type}`)}
          </Button>
        </SelectCardTypePopup>
      </div>
    </Form>
  );
});

AddCard.propTypes = {
  isOpened: PropTypes.bool,
  openOnCreate: PropTypes.bool,
  className: PropTypes.string,
  onCreate: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

AddCard.defaultProps = {
  isOpened: true,
  openOnCreate: false,
  className: undefined,
};

export default AddCard;
