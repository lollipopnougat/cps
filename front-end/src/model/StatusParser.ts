import { PersonStatus, TaxiStatus } from "./enums";

export default class StatusParser {
    static parsePerson(status: PersonStatus): string {
        switch (status) {
            case PersonStatus.Idle:
                return '空闲';
            case PersonStatus.Called:
                return '已叫车';
            case PersonStatus.Moving:
                return '移动中';
            default:
                return '未知的状态';
        }
    }

    static parseTaxi(status: TaxiStatus): string {
        switch (status) {
            case TaxiStatus.Idle:
                return '空闲';
            case TaxiStatus.Busy:
                return '忙碌';
            default:
                return '未知的状态';
        }
    }
}