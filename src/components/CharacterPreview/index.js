// @flow

import type { Character } from 'flowTypes';

import React, { Component } from 'react';
import { connect } from 'react-redux';
import includes from 'lodash/includes';
import get from 'lodash/get';
import { createSelector } from 'reselect';
import cx from 'classnames';

import { leftItems, rightItems } from '../../lib/gw2/equipment';
import ResourceCard from '../ResourceCard';

import ArmoryBadge from '../ArmoryBadge';
import CharacterPortrait from '../CharacterPortrait';
import Gw2Item from '../Gw2Item';

import styles from './styles.less';
import { fetchCharacter } from '../../actions/characters';
import { mergeEliteSpec } from '../../reducers/characters.reducer';

type Props = {
  name: string,
  fetchCharacter: (name: string, any) => void,
  character?: Character,
  className?: string,
};

const selector = createSelector(
  (state, props) => state.characters.data[props.name],
  (character) => ({
    character: mergeEliteSpec(character),
  })
);

const buildCardData = (character) => {
  if (character) {
    return {
      title: character.guild_tag ? `${character.name || 'Api Error.'} [${character.guild_tag}]` : character.name || 'Api Error.',
      imageName: `${character.profession.toLowerCase()}-icon-small.png`,
      subTitle: character.level ? `${character.level} ${character.race} ${character.eliteSpecialization}` : 'Api error.',
    };
  }

  return undefined;
};

export default connect(selector, {
  fetchCharacter,
})(
class CharacterPreview extends Component<Props> {
  props: Props;

  componentDidMount () {
    const name = this.props.name;
    if (!name) {
      return;
    }

    this.loadCharacter(name);
  }

  componentWillReceiveProps (nextProps: Props) {
    if (this.props.name === nextProps.name) {
      return;
    }

    this.loadCharacter(nextProps.name);
  }

  loadCharacter (name: string) {
    this.props.fetchCharacter(name);
  }

  render () {
    const { character, className } = this.props;
    const equipment = get(character, 'equipment', {});
    const profession = get(character, 'profession');
    const safeCharacter = get(this.props, 'character', {});

    return (
      <div className={cx(styles.root, className)}>
        <ArmoryBadge className={styles.badge} hotlink />

        <div className={styles.cover}>
          <CharacterPortrait
            name={safeCharacter.name}
            alias={safeCharacter.alias}
            race={safeCharacter.race}
            className={styles.litePortrait}
          />
        </div>

        <a
          href={`https://gw2armory.com/${safeCharacter.alias}/c/${safeCharacter.name}`}
          className={styles.header}
        >
          <ResourceCard
            appearance="small"
            {...buildCardData(character)}
          />
        </a>

        <div className={styles.equips}>
          {leftItems.concat(rightItems).map((item) => {
            const equip = equipment[item.key] || {};
            return includes(item.hideForClasses, profession) ? null : (
              <Gw2Item
                {...item}
                small
                key={item.key}
                upgradeCounts={equip.upgradeCounts}
                upgrades={equip.upgrades}
                infusions={equip.infusions}
                id={equip.id}
                skinId={equip.skin}
                stats={equip.stats}
                equipped
              />
            );
          })}
        </div>
      </div>
    );
  }
}
);
