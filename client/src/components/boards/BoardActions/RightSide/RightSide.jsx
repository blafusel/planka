/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Icon } from 'semantic-ui-react';
import classNames from 'classnames';
import { usePopup } from '../../../../lib/popup';

import selectors from '../../../../selectors';
import entryActions from '../../../../entry-actions';
import actions from '../../../../actions';
import { BoardContexts, BoardViews } from '../../../../constants/Enums';
import { BoardViewIcons } from '../../../../constants/Icons';
import ActionsStep from './ActionsStep';

import styles from './RightSide.module.scss';

const RightSide = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const showDescriptions = useSelector((state) => {
    const user = selectors.selectCurrentUser(state);
    return user ? !!user.showDescriptionsOnCards : false;
  });

  const dispatch = useDispatch();

  const handleSelectViewClick = useCallback(
    ({ currentTarget: { value: view } }) => {
      dispatch(entryActions.updateViewInCurrentBoard(view));
    },
    [dispatch],
  );

  const handleToggleDescriptionsClick = useCallback(() => {
    dispatch(entryActions.updateCurrentUser({ showDescriptionsOnCards: !showDescriptions }));
  }, [showDescriptions, dispatch]);

  const handleToggleSelectModeClick = useCallback(() => {
    dispatch(actions.updateBoard(board.id, { isSelectMode: !board.isSelectMode, selectedCardIds: [] }));
  }, [board.id, board.isSelectMode, dispatch]);

  const ActionsPopup = usePopup(ActionsStep);

  const views = [BoardViews.GRID, BoardViews.LIST];
  if (board.context === BoardContexts.BOARD) {
    views.unshift(BoardViews.KANBAN);
  }

  return (
    <>
      <div className={styles.action}>
        <div className={styles.buttonGroup}>
          {views.map((view) => (
            <button
              key={view}
              type="button"
              value={view}
              disabled={view === board.view}
              className={styles.button}
              onClick={handleSelectViewClick}
            >
              <Icon fitted name={BoardViewIcons[view]} />
            </button>
          ))}
        </div>
      </div>
      <div className={styles.action}>
        <button
          type="button"
          className={classNames(styles.button, showDescriptions && styles.buttonActive)}
          onClick={handleToggleDescriptionsClick}
          title="Toggle card descriptions"
        >
          <Icon fitted name="align left" />
        </button>
      </div>
      <div className={styles.action}>
        <button
          type="button"
          className={classNames(styles.button, board.isSelectMode && styles.buttonActive)}
          onClick={handleToggleSelectModeClick}
          title="Toggle card selection mode"
        >
          <Icon fitted name="checkmark box" />
        </button>
      </div>
      <div className={styles.action}>
        <ActionsPopup>
          <button type="button" className={styles.button}>
            <Icon fitted name="ellipsis vertical" />
          </button>
        </ActionsPopup>
      </div>
    </>
  );
});

export default RightSide;
