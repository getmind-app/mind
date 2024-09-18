> [!NOTE]  
> Mind was continued, we keep it for documentation

# Mind 

![image](https://github.com/user-attachments/assets/98c09d79-268b-4822-890f-575b3d8f7a23)

## Links
[Notion](https://www.notion.so/getmind/Pitch-3739b63b8eca43a8be88f90bb729baa8)

## About

Built using the [t3-turbo](https://github.com/clerkinc/t3-turbo-and-clerk) template.
- React (Next.js) & React-native (Expo)
- tRPC
- Prisma
- Clerk

## Quick Start

To get it running, follow the steps below:

### Setup dependencies

```diff
# Install dependencies
pnpm i
cp .env.example .env
pnpm db:push
```

### Configure Expo `dev`-script

#### Use iOS Simulator

1. Make sure you have XCode and XCommand Line Tools installed [as shown on expo docs](https://docs.expo.dev/workflow/ios-simulator/).
    > **NOTE:** If you just installed XCode, or if you have updated it, you need to open the simulator manually once. Run `npx expo start` in the root dir, and then enter `I` to launch Expo Go. After the manual launch, you can run `pnpm dev` in the root directory.

```diff
+  "dev": "expo start --ios",
```

3. Run `pnpm dev` at the project root folder.

> **TIP:** It might be easier to run each app in separate terminal windows so you get the logs from each app separately. This is also required if you want your terminals to be interactive, e.g. to access the Expo QR code. You can run `pnpm --filter expo dev` and `pnpm --filter nextjs dev` to run each app in a separate terminal window.

#### For Android

1. Install Android Studio tools [as shown on expo docs](https://docs.expo.dev/workflow/android-studio-emulator/).
2. Change the `dev` script at `apps/expo/package.json` to open the Android emulator.

```diff
+  "dev": "expo start --android",
```

3. Run `pnpm dev` at the project root folder.

## Deployment

### Next.js

#### Prerequisites

_We do not recommend deploying a SQLite database on serverless environments since the data wouldn't be persisted. I provisioned a quick Postgresql database on [Railway](https://railway.app), but you can of course use any other database provider. Make sure the prisma schema is updated to use the correct database._

**Please note that the Next.js application with tRPC must be deployed in order for the Expo app to communicate with the server in a production environment.**

#### Deploy to Vercel

Let's deploy the Next.js application to [Vercel](https://vercel.com/). If you have ever deployed a Turborepo app there, the steps are quite straightforward. You can also read the [official Turborepo guide](https://vercel.com/docs/concepts/monorepos/turborepo) on deploying to Vercel.

1. Create a new project on Vercel, select the `apps/nextjs` folder as the root directory and apply the following build settings:

<img width="927" alt="Vercel deployment settings" src="https://user-images.githubusercontent.com/11340449/201974887-b6403a32-5570-4ce6-b146-c486c0dbd244.png">

> The install command filters out the expo package and saves a few second (and cache size) of dependency installation. The build command makes us build the application using Turbo.

2. Add your `DATABASE_URL` environment variable.

3. Done! Your app should successfully deploy. Assign your domain and use that instead of `localhost` for the `url` in the Expo app so that your Expo app can communicate with your backend when you are not in development.

### Expo

Deploying your Expo application works slightly differently compared to Next.js on the web. Instead of "deploying" your app online, you need to submit production builds of your app to the app stores, like [Apple App Store](https://www.apple.com/app-store/) and [Google Play](https://play.google.com/store/apps). You can read the full [Distributing your app](https://docs.expo.dev/distribution/introduction/), including best practices, in the Expo docs.

1. Make sure to modify the `getBaseUrl` function to point to your backend's production URL:

https://github.com/t3-oss/create-t3-turbo/blob/656965aff7db271e5e080242c4a3ce4dad5d25f8/apps/expo/src/utils/api.tsx#L20-L37

2. Let's start by setting up [EAS Build](https://docs.expo.dev/build/introduction/), which is short for Expo Application Services. The build service helps you create builds of your app, without requiring a full native development setup. The commands below are a summary of [Creating your first build](https://docs.expo.dev/build/setup/).

    ```bash
    // Install the EAS CLI
    $ pnpm add -g eas-cli

    // Log in with your Expo account
    $ eas login

    // Configure your Expo app
    $ cd apps/expo
    $ eas build:configure
    ```

3. After the initial setup, you can create your first build. You can build for Android and iOS platforms and use different [**eas.json** build profiles](https://docs.expo.dev/build-reference/eas-json/) to create production builds or development, or test builds. Let's make a production build for iOS.

    ```
    $ eas build --platform ios --profile production
    ```

    > If you don't specify the `--profile` flag, EAS uses the `production` profile by default.

4. Now that you have your first production build, you can submit this to the stores. [EAS Submit](https://docs.expo.dev/submit/introduction/) can help you send the build to the stores.

    ```
    $ eas submit --platform ios --latest
    ```

    > You can also combine build and submit in a single command, using `eas build ... --auto-submit`.

5. Before you can get your app in the hands of your users, you'll have to provide additional information to the app stores. This includes screenshots, app information, privacy policies, etc. _While still in preview_, [EAS Metadata](https://docs.expo.dev/eas/metadata/) can help you with most of this information.

6. Once everything is approved, your users can finally enjoy your app. Let's say you spotted a small typo; you'll have to create a new build, submit it to the stores, and wait for approval before you can resolve this issue. In these cases, you can use EAS Update to quickly send a small bugfix to your users without going through this long process. Let's start by setting up EAS Update.

    The steps below summarize the [Getting started with EAS Update](https://docs.expo.dev/eas-update/getting-started/#configure-your-project) guide.

    ```bash
    // Add the `expo-updates` library to your Expo app
    $ cd apps/expo
    $ pnpm expo install expo-updates

    // Configure EAS Update
    $ eas update:configure
    ```

7. Before we can send out updates to your app, you have to create a new build and submit it to the app stores. For every change that includes native APIs, you have to rebuild the app and submit the update to the app stores. See steps 2 and 3.

8. Now that everything is ready for updates, let's create a new update for `production` builds. With the `--auto` flag, EAS Update uses your current git branch name and commit message for this update. See [How EAS Update works](https://docs.expo.dev/eas-update/how-eas-update-works/#publishing-an-update) for more information.

    ```bash
    $ cd apps/expo
    $ eas update --auto
    ```

    > Your OTA (Over The Air) updates must always follow the app store's rules. You can't change your app's primary functionality without getting app store approval. But this is a fast way to update your app for minor changes and bug fixes.

9. Done! Now that you have created your production build, submitted it to the stores, and installed EAS Update, you are ready for anything!

## I18n

Translations use the [lingui](https://lingui.dev/) internationalization framework to extract and compile the translations in different languages. Different languages/locales need to be loaded and then activated, we use [expo-localization](https://docs.expo.dev/versions/latest/sdk/localization/) to know what languages the user's device is configured to use, this happens at `app/_layout.tsx`. Translating pages require the import of the `<Trans/>` component and `t()` function from the package `@lingui/macro` and you use them like this:

```jsx
<Text>
   <Trans>Welcome</Trans>
</Text>
<Button text={t({message: "Click me"})}/>
```

Basically you use `<Trans/>` to translate text nodes and `t` for what needs to be passed to another function or component. After you're done with adding them to the section you want to translate you `cd` into `apps/expo` and run `pnpm extract` this is going to extract into the directories for each locale all the text that can be translated into a `messages.po` file, untranslated text is going to look like this:

```
# locales/pt/messages.po
#: src/app/index.tsx:55
msgid "Welcome"
msgstr ""
```

Then you fill out the missing `msgstr`:

```
# locales/pt/messages.po
#: src/app/index.tsx:55
msgid "Welcome"
msgstr "Bem-vindo"
```

Now, with the messages translated you can compile them running, `pnpm compile`, also in `apps/expo`, that will create a `messages.js` file for lingui to pick up at run time.
