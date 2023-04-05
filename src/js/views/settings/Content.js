import Component from '../../BaseComponent';
import localState from '../../LocalState';
import { translate as t } from '../../translations/Translation';

export default class Content extends Component {
  constructor() {
    super();
    this.id = 'settings';
    this.state = {
      settings: {},
    };
  }

  componentDidMount() {
    localState.get('settings').on(this.inject());
  }

  render() {
    const noteSettings = [
      // { setting: 'enableMarkdown', label: 'Markdown' },
      { setting: 'loadRepliesAndReactions', label: 'Replies and reactions' },
    ];
    const mediaSettings = [
      { setting: 'enableImages', label: 'Images' },
      { setting: 'enableAudio', label: 'Audio' },
      { setting: 'enableVideos', label: 'Videos' },
      { setting: 'autoplayVideos', label: 'Autoplay videos' },
      { setting: 'enableWebtorrent', label: 'Webtorrent' },
      { setting: 'enableYoutube', label: 'YouTube' },
      { setting: 'enableTwitter', label: 'Twitter' },
      { setting: 'enableInstagram', label: 'Instagram' },
      { setting: 'enableSpotify', label: 'Spotify' },
      { setting: 'enableTidal', label: 'Tidal' },
      { setting: 'enableTwitch', label: 'Twitch' },
      { setting: 'enableWavlake', label: 'Wavlake' },
    ];
    return (
      <>
        <div class="centered-container">
          <h2>{t('content')}</h2>

          <h3>{t('notes')}</h3>
          {noteSettings.map(({ setting, label }) => (
            <p key={setting}>
              <input
                type="checkbox"
                checked={this.state.settings[setting] !== false}
                onChange={() =>
                  localState
                    .get('settings')
                    .get(setting)
                    .put(!(this.state.settings[setting] !== false))
                }
                id={setting}
              />
              <label htmlFor={setting}>{label}</label>
            </p>
          ))}

          <h3>{t('media')}</h3>
          {mediaSettings.map(({ setting, label }) => (
            <p key={setting}>
              <input
                type="checkbox"
                checked={this.state.settings[setting] !== false}
                onChange={() =>
                  localState
                    .get('settings')
                    .get(setting)
                    .put(!(this.state.settings[setting] !== false))
                }
                id={setting}
              />
              <label htmlFor={setting}>{label}</label>
            </p>
          ))}
        </div>
      </>
    );
  }
}
