/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, Icon } from 'semantic-ui-react';

import selectors from '../../../selectors';
import actions from '../../../actions';
import entryActions from '../../../entry-actions';

import styles from './SelectionBar.module.scss';

const SelectionBar = React.memo(() => {
  const board = useSelector(selectors.selectCurrentBoard);
  const listIds = useSelector(selectors.selectKanbanListIdsForCurrentBoard);

  const lists = useSelector((state) =>
    listIds.map((listId) => selectors.selectListById(state, listId)).filter(Boolean),
  );

  const allCardIds = useSelector((state) =>
    listIds.flatMap((listId) => selectors.selectCardIdsByListId(state, listId)),
  );

  const dispatch = useDispatch();

  const selectedCount = board.selectedCardIds ? board.selectedCardIds.length : 0;

  const handleSelectAll = useCallback(() => {
    dispatch(actions.updateBoard(board.id, { selectedCardIds: allCardIds }));
  }, [board.id, allCardIds, dispatch]);

  const handleClearSelection = useCallback(() => {
    dispatch(actions.updateBoard(board.id, { selectedCardIds: [], isSelectMode: false }));
  }, [board.id, dispatch]);

  const handleArchive = useCallback(() => {
    if (!board.selectedCardIds) return;
    board.selectedCardIds.forEach((cardId) => {
      dispatch(entryActions.moveCardToArchive(cardId));
    });
    dispatch(actions.updateBoard(board.id, { selectedCardIds: [], isSelectMode: false }));
  }, [board.id, board.selectedCardIds, dispatch]);

  const handleTrash = useCallback(() => {
    if (!board.selectedCardIds) return;
    board.selectedCardIds.forEach((cardId) => {
      dispatch(entryActions.moveCardToTrash(cardId));
    });
    dispatch(actions.updateBoard(board.id, { selectedCardIds: [], isSelectMode: false }));
  }, [board.id, board.selectedCardIds, dispatch]);

  const handleMoveToList = useCallback(
    (listId) => {
      if (!board.selectedCardIds) return;
      board.selectedCardIds.forEach((cardId) => {
        dispatch(entryActions.moveCard(cardId, listId));
      });
      dispatch(actions.updateBoard(board.id, { selectedCardIds: [], isSelectMode: false }));
    },
    [board.id, board.selectedCardIds, dispatch],
  );

  if (!board.isSelectMode) {
    return null;
  }

  const moveOptions = lists.map((list) => ({
    key: list.id,
    text: list.name,
    value: list.id,
  }));

  return (
    <div className={styles.wrapper}>
      <span className={styles.count}>
        {selectedCount} card{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <Button size="mini" className={styles.action} onClick={handleSelectAll}>
        <Icon name="check square" />
        Select all
      </Button>
      {selectedCount > 0 && (
        <>
          <Button size="mini" className={styles.action} onClick={handleArchive} title="Archive selected">
            <Icon name="archive" />
            Archive
          </Button>
          <Button size="mini" color="red" className={styles.action} onClick={handleTrash} title="Move to trash">
            <Icon name="trash" />
            Trash
          </Button>
          <Dropdown
            className={styles.moveDropdown}
            text="Move to..."
            button
            pointing="top"
            options={moveOptions}
            onChange={(_, { value }) => handleMoveToList(value)}
            value={null}
          />
        </>
      )}
      <button type="button" className={styles.close} onClick={handleClearSelection} title="Exit selection mode">
        <Icon fitted name="close" />
      </button>
    </div>
  );
});

export default SelectionBar;
