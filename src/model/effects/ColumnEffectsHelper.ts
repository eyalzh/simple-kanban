import ColumnEffectsFactory from "./ColumnEffectsFactory";
import {ColumnEffectConfig} from "../Column";

export default class ColumnEffectsHelper {

    static parseEffectsFromName(name: string): ColumnEffectConfig[] {

        const effectIds: ColumnEffectConfig[] = [];
        const effectMapper = ColumnEffectsFactory.getEffectIdMapper();

        Object.keys(effectMapper).forEach(effectId => {
            const effect = ColumnEffectsFactory.getColumnEffectById(effectId);
            if (effect) {
                const matchedPattern = effect.matchPattern(name);
                if (matchedPattern.matched) {
                    effectIds.push({id: effectId, config: matchedPattern.config});
                }
            }
        });

        return effectIds;

    }
}
