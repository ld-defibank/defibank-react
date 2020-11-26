# React & Unstated-next start kit

## 开发

```shell
$ npm run dev
```

可以在Component里直接使用model，参见`common/formattedMessage`:

```javascript
import I18n from '../models/i18n';
...
const i18n = I18n.useContainer();
```

也可以使用`connect`来将model的`state`映射到`props`，参见`layout/header`:

```javascript
import I18n from '../../models/i18n';
import { connect } from '../../models';

function MyHeader({ i18n, setLocale }) {
  ...
}

function mapStateToProps([i18n]) {
  const { setLocale } = i18n;
  return {
    i18n: i18n.i18n,
    setLocale,
  };
}

export default connect([I18n])(mapStateToProps)(MyHeader);
```

## 生产

```shell
$ npm run production
```
