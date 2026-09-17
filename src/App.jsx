import { useState, useEffect, useCallback } from 'react';
import './index.css';

// ─── Question Bank ────────────────────────────────────────────────────────────
// Each question has: id, domain, question text, 4 options, correct index (0-3),
// and an explanation shown after answering.
const QUESTION_BANK = [
  // ── Domain 1: Prepare Infrastructure (20–25%) ──────────────────────────────
  {
    id: 'D1-01',
    domain: 'Prepare Infrastructure',
    question: 'Which device join type should you use for a cloud-only Windows device that has no on-premises Active Directory connectivity?',
    options: [
      'Hybrid Azure AD joined',
      'Azure AD registered',
      'Azure AD joined',
      'Domain joined with Azure AD Connect sync',
    ],
    correct: 2,
    explanation: 'Azure AD joined (now called Microsoft Entra ID joined) is the cloud-only join type for devices with no on-prem AD. Hybrid join requires AD Connect and on-prem connectivity. Azure AD registered is for personal/BYOD devices. Domain joined with sync is a hybrid scenario.',
  },
  {
    id: 'D1-02',
    domain: 'Prepare Infrastructure',
    question: 'You need to enroll 500 corporate-owned Android devices without user interaction at the device. Which enrollment method do you use?',
    options: [
      'User-driven enrollment via Company Portal app',
      'Samsung Knox Mobile Enrollment or Google Zero Touch',
      'Android work profile enrollment with a QR code',
      'Fully managed enrollment via Apple Business Manager',
    ],
    correct: 1,
    explanation: 'Samsung Knox Mobile Enrollment and Google Zero Touch allow zero-touch, out-of-box enrollment for corporate-owned Android devices without user interaction. User-driven and QR code require user action. Apple Business Manager is for iOS/macOS, not Android.',
  },
  {
    id: 'D1-03',
    domain: 'Prepare Infrastructure',
    question: 'A dynamic device group membership rule must include all devices whose displayName starts with "NYC-". Which rule syntax is correct?',
    options: [
      '(device.displayName -eq "NYC-*")',
      '(device.displayName -contains "NYC-")',
      '(device.displayName -startsWith "NYC-")',
      '(device.displayName -like "NYC-*")',
    ],
    correct: 2,
    explanation: 'The correct syntax for "starts with" in a Microsoft Entra dynamic group rule is `-startsWith`. `-eq` is exact match; `-contains` matches substring anywhere; `-like` is not valid in dynamic group rules.',
  },
  {
    id: 'D1-04',
    domain: 'Prepare Infrastructure',
    question: 'A Windows 11 device has been Azure AD joined but does not appear in Microsoft Intune. What is the most likely cause?',
    options: [
      'The device is not compliant with a compliance policy',
      'Intune auto-enrollment is not configured or the device has not synced',
      'Windows Hello for Business is not configured',
      'The device has not been assigned a configuration profile',
    ],
    correct: 1,
    explanation: 'After Azure AD join, the device must have Intune auto-enrollment enabled in Entra ID device settings AND must sync to register with Intune. Compliance, WHfB, and config profiles are not prerequisites for the device to appear in Intune.',
  },
  {
    id: 'D1-05',
    domain: 'Prepare Infrastructure',
    question: 'Which Windows Autopilot deployment mode requires zero user interaction and is designed for kiosk or shared devices?',
    options: [
      'User-driven mode',
      'Pre-provisioning mode',
      'Self-deploying mode',
      'Hybrid Autopilot mode',
    ],
    correct: 2,
    explanation: 'Self-deploying mode requires zero user interaction and is designed for kiosks, shared devices, and scenarios where no user signs in during deployment. User-driven requires user sign-in. Pre-provisioning requires IT admin prep via Autopilot. There is no "Hybrid Autopilot mode."',
  },
  {
    id: 'D1-06',
    domain: 'Prepare Infrastructure',
    question: 'What is the primary benefit of using Windows Hello for Business with certificate trust over key trust?',
    options: [
      'It does not require a TPM chip',
      'It supports roaming of credentials to non-Windows platforms',
      'It integrates with PKI and provides stronger phishing resistance via certificates',
      'It eliminates the need for a PIN',
    ],
    correct: 2,
    explanation: 'Certificate trust uses PKI certificates stored in the TPM and offers stronger phishing resistance and integration with existing PKI infrastructure. Key trust uses asymmetric keys and is simpler to deploy but certificate trust provides stronger identity assertions. Both require a TPM. Neither eliminates the PIN requirement.',
  },
  {
    id: 'D1-07',
    domain: 'Prepare Infrastructure',
    question: 'You need to block personal iOS/iPadOS devices from enrolling in Intune while allowing corporate-owned devices. How do you configure this?',
    options: [
      'Create a compliance policy that marks personal devices as non-compliant',
      'Configure an enrollment restriction that blocks the iOS platform type for personal devices',
      'Remove the iOS app from the Company Portal',
      'Disable Apple Business Manager integration',
    ],
    correct: 1,
    explanation: 'Enrollment restrictions in Intune allow you to block or limit enrollment by platform type (iOS, Android, etc.) and by device ownership (personal vs. corporate). Compliance policies evaluate devices after enrollment, so they cannot block enrollment itself.',
  },
  {
    id: 'D1-08',
    domain: 'Prepare Infrastructure',
    question: 'Which PowerShell command checks the current Microsoft Entra ID join state of a Windows device?',
    options: [
      'dsregcmd /join',
      'dsregcmd /status',
      'dsregcmd /leave',
      'Get-AzureADDevice -ObjectId <id>',
    ],
    correct: 1,
    explanation: 'dsregcmd /status displays the current device join state (Azure AD joined, registered, both, or neither). dsregcmd /join initiates a join; /leave leaves the join. Get-AzureADDevice queries Entra ID server-side, not local device state.',
  },

  // ── Domain 2: Manage and Maintain Devices (25–30%) ─────────────────────────
  {
    id: 'D2-01',
    domain: 'Manage & Maintain Devices',
    question: 'You have a legacy on-premises Group Policy (ADMX) that must be enforced on managed Windows 11 devices in Intune. What is the correct approach?',
    options: [
      'Recreate the GPO settings manually in Intune configuration profiles',
      'Import the ADMX files into Intune and use Group Policy analytics to assess overlap, then apply via ADMX-backed configuration profiles',
      'Deploy a scheduled PowerShell script that applies the GPO settings',
      'Use Co-management to sync the on-prem GPO to Intune',
    ],
    correct: 1,
    explanation: 'Import the ADMX file into Intune via Device configuration → Import ADMX, then use Group Policy analytics to see which settings already exist in Intune and where overlap exists. ADMX-backed configuration profiles then enforce the settings. Recreating manually is error-prone; scripts are not policy-driven; co-management is for ConfigMgr, not standalone GPO→Intune sync.',
  },
  {
    id: 'D2-02',
    domain: 'Manage & Maintain Devices',
    question: 'What is the key functional difference between the Intune Enterprise App Catalog and the Company Portal?',
    options: [
      'The Enterprise App Catalog is for LOB apps managed centrally by IT; the Company Portal is the self-service app store for end users',
      'The Enterprise App Catalog replaces the Company Portal entirely',
      'The Company Portal only supports iOS apps; the Enterprise App Catalog supports Windows',
      'There is no difference; they are the same app',
    ],
    correct: 0,
    explanation: 'The Enterprise App Catalog (Intune Suite) is a centrally managed catalog for IT to publish and manage line-of-business apps with controlled distribution. The Company Portal is the end-user self-service app store where users browse and install approved apps. They coexist; the catalog does not replace the portal.',
  },
  {
    id: 'D2-03',
    domain: 'Manage & Maintain Devices',
    question: 'A device must be wiped for security reasons, but the user\'s personal data must be preserved for a forensic investigation. Which remote action do you perform?',
    options: [
      'Full factory reset (wipe)',
      'Retire the device',
      'Sync the device',
      'Locate the device',
    ],
    correct: 0,
    explanation: 'A full wipe (factory reset) removes all data including personal data, which is required for security-driven wipes but would destroy forensic evidence. However, in practice, if forensic preservation is needed, you should NOT wipe — you should isolate the device (e.g., remove from management, block access) and let forensics image it. Among the listed options, "wipe" is the security action, but the forensic note is a caveat. In exam context, retire removes corporate data but keeps personal data on the device (BYOD scenario); locate only shows position.',
  },
  {
    id: 'D2-04',
    domain: 'Manage & Maintain Devices',
    question: 'What is Microsoft Tunnel for MAM, and when would you use it?',
    options: [
      'A full-device VPN profile for all managed devices',
      'A VPN-less access method that provides secure corporate resource access for MAM-only managed apps without enrolling the device in MDM',
      'A tunneling protocol for Autopilot deployment traffic',
      'A remote help session tunneling feature',
    ],
    correct: 1,
    explanation: 'Microsoft Tunnel for MAM extends VPN-less secure access to devices that are only managed via MAM (app protection policies) and not enrolled in MDM. It uses the Tunnel Gateway to provide access to corporate resources for managed apps without a full-device VPN profile. It is not for Autopilot, remote help, or full-device VPN.',
  },
  {
    id: 'D2-05',
    domain: 'Manage & Maintain Devices',
    question: 'How do assignment filters and enrollment time grouping differ in targeting configuration profiles?',
    options: [
      'They are the same feature with different names',
      'Assignment filters target by device properties dynamically; enrollment time grouping targets devices based on when they enrolled',
      'Enrollment time grouping targets by device properties; assignment filters target by enrollment timestamp',
      'Assignment filters apply only to compliance policies, not configuration profiles',
    ],
    correct: 1,
    explanation: 'Assignment filters dynamically target devices based on device properties (OS version, SKU, etc.) at policy evaluation time. Enrollment time grouping groups devices based on when they enrolled (e.g., "enrolled in the last 7 days") to apply policies gradually. They serve different targeting purposes.',
  },
  {
    id: 'D2-06',
    domain: 'Manage & Maintain Devices',
    question: 'Which Intune Suite capability provides Just-In-Time elevation for local administrators without making them permanent admins?',
    options: [
      'Intune Remote Help',
      'Endpoint Privilege Management (EPM)',
      'Microsoft Cloud PKI',
      'Intune Advanced Analytics',
    ],
    correct: 1,
    explanation: 'Endpoint Privilege Management (EPM) provides elevation policies that grant local admin rights for specific applications or tasks on a Just-In-Time basis without making the user a permanent local administrator. Remote Help is for remote assistance; Cloud PKI is for certificate issuance; Advanced Analytics is for device insights.',
  },
  {
    id: 'D2-07',
    domain: 'Manage & Maintain Devices',
    question: 'A Windows 365 Cloud PC provisioning policy must be configured. Which three elements are part of a provisioning policy?',
    options: [
      'Device name template, BitLocker policy, and Windows Update ring',
      'Image selection, network connection (entra ID / hybrid), and user/device assignment',
      'Autopilot profile, ESP configuration, and enrollment restriction',
      'M365 Apps channel, ODT configuration, and Office update deferral',
    ],
    correct: 1,
    explanation: 'Windows 365 provisioning policies include: (1) the Windows 365 image (version, language), (2) network connection type (Entra ID-only or hybrid), and (3) assignment (which users or devices get the Cloud PC). BitLocker, update rings, Autopilot profiles, and ODT are separate management areas, not part of the provisioning policy itself.',
  },

  // ── Domain 3: Protect Devices (15–20%) ──────────────────────────────────────
  {
    id: 'D3-01',
    domain: 'Protect Devices',
    question: 'BitLocker recovery keys are not appearing in Microsoft Entra ID after enabling BitLocker via Intune. What are the two most likely causes?',
    options: [
      'The device is not compliant and the BitLocker policy is in audit mode',
      'The BitLocker policy does not have "Back up recovery key to Entra ID" enabled, or the device has not synced after encryption',
      'Windows Hello for Business is not configured on the device',
      'The device is not enrolled in Defender for Endpoint',
    ],
    correct: 1,
    explanation: 'The two most likely causes: (1) The Intune BitLocker policy must explicitly enable backup of the recovery key to Entra ID (or AAD), and (2) the device must sync and complete encryption so the key is generated and backed up. WHfB and Defender enrollment are not prerequisites for BitLocker key backup.',
  },
  {
    id: 'D3-02',
    domain: 'Protect Devices',
    question: 'An Attack Surface Reduction (ASR) rule has been deployed in Audit mode for two weeks. You see 200 audit events in the Microsoft Defender portal. What is the correct next step before switching to Block mode?',
    options: [
      'Immediately switch the rule to Block mode to protect the environment',
      'Review the audit events to identify false positives, test the rule in a pilot group, then switch to Block mode',
      'Delete the ASR rule and deploy a different security baseline',
      'Switch the rule to Block mode only for devices that generated audit events',
    ],
    correct: 1,
    explanation: 'Before switching an ASR rule from Audit to Block, you must review the audit events to identify any legitimate activities being flagged (false positives). Test in a pilot group first. Blocking immediately risks disrupting legitimate business processes. Deleting or blocking only on devices with events are not best practices.',
  },
  {
    id: 'D3-03',
    domain: 'Protect Devices',
    question: 'You need to deploy a critical security update to all Windows 11 devices within 48 hours while deferring all other feature and quality updates. Which Intune capability do you use?',
    options: [
      'A standard update ring with a 0-day deferral',
      'Windows Autopatch with an exception ring',
      'A dedicated update ring with specific KB deployment or a targeted update policy',
      'Delivery Optimization with peer caching enabled',
    ],
    correct: 2,
    explanation: 'To deploy a specific critical update quickly while deferring others, create a targeted update policy or use a dedicated update ring that allows you to control which updates are deployed and when. A standard update ring with 0-day deferral deploys all updates. Autopatch automates rings but is not designed for one-off critical update targeting. Delivery Optimization is a bandwidth optimization, not update targeting.',
  },
  {
    id: 'D3-04',
    domain: 'Protect Devices',
    question: 'What is the key difference between Windows Autopatch and a manually created update ring?',
    options: [
      'Autopatch requires on-premises infrastructure; update rings do not',
      'Autopatch automatically manages update rings, drivers, and app updates as a managed service; update rings are manually configured policies',
      'Autopatch only updates apps; update rings only update the OS',
      'There is no difference; they are the same feature with different names',
    ],
    correct: 1,
    explanation: 'Windows Autopatch is a managed service that automatically creates and manages update rings, driver updates, and Microsoft 365 Apps updates with minimal IT overhead. A manually created update ring gives IT full control over deferral periods, active hours, and restart settings but requires manual management. Autopatch does not require on-prem infrastructure.',
  },
  {
    id: 'D3-05',
    domain: 'Protect Devices',
    question: 'How do you verify that a Windows 11 device has been successfully onboarded to Microsoft Defender for Endpoint?',
    options: [
      'Check that the device appears in the Intune device list with a "Defender" tag',
      'Verify the device appears in the Microsoft Defender portal (securitycenter.microsoft.com) under Devices, and check the onboard status in the device properties',
      'Run Windows Security and confirm Defender Antivirus is active',
      'Check the Event Viewer for a specific Defender onboard event ID',
    ],
    correct: 1,
    explanation: 'Successful onboarding to Defender for Endpoint is verified by confirming the device appears in the Microsoft Defender portal (securitycenter.microsoft.com) under the Devices node. The onboard status and health are shown there. Intune device list does not show a "Defender" tag; Windows Security showing AV active is not the same as EDR onboard; Event Viewer can show events but the authoritative source is the Defender portal.',
  },
  {
    id: 'D3-06',
    domain: 'Protect Devices',
    question: 'Which Intune endpoint security policy type would you configure to block inbound traffic on port 445 (SMB) from the Internet while allowing internal LAN traffic?',
    options: [
      'Antivirus policy',
      'Firewall policy',
      'Attack Surface Reduction policy',
      'Disk encryption policy',
    ],
    correct: 1,
    explanation: 'Firewall policies in Intune endpoint security allow you to create inbound/outbound rules based on port, protocol, and application. To block port 445 from the Internet while allowing internal LAN, you configure a firewall rule with the appropriate scope (e.g., remote IP range = Internet, action = Block). ASR rules focus on exploit mitigation behaviors, not port-based filtering. Antivirus and disk encryption policies do not control network ports.',
  },
  {
    id: 'D3-07',
    domain: 'Protect Devices',
    question: 'You want to allow users to recover their own BitLocker recovery key without calling the help desk. How do you configure this in Intune?',
    options: [
      'Enable user self-service recovery in the BitLocker policy and ensure the recovery key is backed up to Entra ID',
      'Deploy a PowerShell script that reads the BitLocker key and emails it to the user',
      'Configure a compliance policy that prompts the user for the key',
      'Disable BitLocker and use Device Encryption instead',
    ],
    correct: 0,
    explanation: 'In the Intune BitLocker (disk encryption) policy, you can enable user self-service recovery, which allows users to retrieve their BitLocker recovery key from the Windows settings or Entra ID portal, provided the key is backed up to Entra ID. Scripts and compliance policies are not the correct mechanism. Device Encryption is a lighter-weight alternative but does not provide the same key management features.',
  },

  // ── Domain 4: Manage and Secure Applications (15–20%) ──────────────────────
  {
    id: 'D4-01',
    domain: 'Manage & Secure Apps',
    question: 'You need to deploy a Win32 app that requires .NET 6 runtime to be installed first. How do you model this in Intune?',
    options: [
      'Deploy the .NET runtime as a separate Win32 app and use the "dependencies" feature in the main app to require it',
      'Include the .NET runtime installer inside the .intunewin package',
      'Deploy a PowerShell script that installs .NET before the app',
      'Use the "requirements" feature to check for .NET and skip installation if missing',
    ],
    correct: 0,
    explanation: 'In Intune Win32 app deployment, you can define "dependencies" — prerequisite apps (e.g., .NET runtime as a separate Win32 app) that must be installed before the main app. Including the runtime inside the package is possible but not the dependency modelling approach. Requirements check conditions but do not install prerequisites. Scripts are not the native dependency mechanism.',
  },
  {
    id: 'D4-02',
    domain: 'Manage & Secure Apps',
    question: 'A BYOD user needs access to corporate Outlook on iOS without enrolling the device in MDM. Which Intune feature do you configure?',
    options: [
      'A device configuration profile for iOS',
      'An app protection policy (MAM) for Outlook',
      'A compliance policy for the device',
      'A Win32 app deployment of Outlook',
    ],
    correct: 1,
    explanation: 'App protection policies (MAM) can be applied to managed apps (like Outlook) on unmanaged/BYOD devices without requiring MDM enrollment. The policy controls data protection (copy/paste, save-as, encryption) within the app. Device configuration and compliance policies require MDM enrollment. Win32 app deployment is for Windows.',
  },
  {
    id: 'D4-03',
    domain: 'Manage & Secure Apps',
    question: 'Which data protection setting in an app protection policy prevents users from copying corporate data from Outlook and pasting it into a personal app?',
    options: [
      'Encrypt app data at rest',
      'Block save-as to personal storage',
      'Configure data transfer restrictions (cut, copy, paste) between managed and unmanaged apps',
      'Require a PIN to open the app',
    ],
    correct: 2,
    explanation: 'The "Data transfer" or "Cut, copy, paste" restriction in an app protection policy controls data movement between managed apps and unmanaged/personal apps. You can block cut/copy/paste from managed to unmanaged apps. Encrypting at rest protects data storage; save-as blocks saving files; PIN protects app access — but only the data transfer restriction specifically controls copy/paste between app contexts.',
  },
  {
    id: 'D4-04',
    domain: 'Manage & Secure Apps',
    question: 'How does the Office Deployment Tool (ODT) integrate with Intune for Windows Autopilot deployments?',
    options: [
      'ODT is not compatible with Intune; you must use the Company Portal to install Office',
      'You create a Win32 app package containing ODT and a custom configuration.xml, or use the Intune M365 Apps integration to push ODT config during Autopilot',
      'ODT runs automatically on all Windows devices without any Intune configuration',
      'ODT is only used for on-premises Office deployment, not cloud',
    ],
    correct: 1,
    explanation: 'For Autopilot deployments, you can deploy Microsoft 365 Apps using ODT by packaging ODT + a custom configuration.xml as a Win32 app in Intune, OR use the native Intune Microsoft 365 Apps integration which allows you to configure the installation via the Intune admin center (including during Autopilot). ODT is fully compatible with Intune. It is not automatic without configuration; it is not limited to on-premises.',
  },
  {
    id: 'D4-05',
    domain: 'Manage & Secure Apps',
    question: 'What is the purpose of "Quiet Time" in Intune app deployment, and on which platforms is it available?',
    options: [
      'Quiet Time blocks all app deployments during business hours; available on all platforms',
      'Quiet Time prevents apps from being installed or updated during specified hours to avoid disrupting the user; available on Android and iOS/iPadOS',
      'Quiet Time encrypts app data during non-business hours; available on Windows only',
      'Quiet Time is a compliance policy that marks devices as non-compliant during quiet hours',
    ],
    correct: 1,
    explanation: 'Quiet Time in Intune app deployment allows you to specify a time window during which apps will not be installed or updated, preventing disruptions for users (e.g., during evenings or weekends). It is available for Android and iOS/iPadOS app deployments. It is not for encryption, compliance, or Windows-only.',
  },
  {
    id: 'D4-06',
    domain: 'Manage & Secure Apps',
    question: 'A Conditional Access policy requires "app protection policy compliance" before granting access to corporate Exchange Online. Does this apply to MDM-enrolled devices, unmanaged devices, or both?',
    options: [
      'Only to MDM-enrolled devices',
      'Only to unmanaged/BYOD devices',
      'To both MDM-enrolled and unmanaged devices, as long as the app is protected by an app protection policy',
      'To neither; Conditional Access cannot evaluate app protection policy compliance',
    ],
    correct: 2,
    explanation: 'Conditional Access can evaluate app protection policy (MAM) compliance for both MDM-enrolled and unmanaged devices, as long as the client app (e.g., Outlook) has an app protection policy applied. This allows you to protect data on BYOD devices without requiring full MDM enrollment. CA can evaluate MAM compliance; it applies to both device types.',
  },
  {
    id: 'D4-07',
    domain: 'Manage & Secure Apps',
    question: 'You need to deploy a line-of-business app to Windows devices via Microsoft Store for Business (now Microsoft Apps for Business). How do you do this in Intune?',
    options: [
      'Upload the .appx package directly to Intune as a Windows app',
      'Use the Intune integration with Microsoft Store for Business to sync and deploy apps from the store',
      'Deploy a web link to the Store page and ask users to install it manually',
      'Use Apple Volume Purchase Program to distribute Windows apps',
    ],
    correct: 1,
    explanation: 'Intune integrates with Microsoft Store for Business (Microsoft Apps for Business) to sync and deploy store apps to Windows devices. You connect your store account to Intune and select apps to deploy. Direct .appx upload is for LOB apps you package yourself; a web link is not a managed deployment; Apple VPP is for iOS/macOS, not Windows.',
  },

  // ── Domain 5: Optimize Endpoint Operations (10–15%) ────────────────────────
  {
    id: 'D5-01',
    domain: 'Optimize Operations',
    question: 'You need to programmatically create 50 device configuration profiles, one per branch office, using Microsoft Graph. Which permission scope is required?',
    options: [
      'DeviceManagementConfiguration.Read.All',
      'DeviceManagementConfiguration.ReadWrite.All',
      'DeviceManagementManagedDevices.ReadWrite.All',
      'DeviceManagementApps.ReadWrite.All',
    ],
    correct: 1,
    explanation: 'To create (write) device configuration profiles via Microsoft Graph, you need DeviceManagementConfiguration.ReadWrite.All. Read.All is read-only. ManagedDevices.ReadWrite.All is for remote actions on devices, not policy creation. Apps.ReadWrite.All is for app deployments.',
  },
  {
    id: 'D5-02',
    domain: 'Optimize Operations',
    question: 'A proactive remediation script is failing on 10% of targeted devices. How do you investigate the failure and re-run the remediation?',
    options: [
      'Delete and recreate the script; failures cannot be investigated',
      'Review the proactive remediation run results in Intune (Endpoint analytics → Proactive remediations), check the detection and remediation script outputs per device, and manually re-run or adjust the script',
      'Reboot all devices and the script will automatically succeed',
      'Run the script manually on each failing device via RDP',
    ],
    correct: 1,
    explanation: 'Intune proactive remediations provide run results per device showing detection and remediation script output, exit codes, and timestamps. You can review these in Endpoint analytics → Proactive remediations, diagnose the failure (e.g., script error, permissions, missing dependencies), adjust the script, and re-run (either by updating the script and saving, or by triggering a manual sync/remediation run). Rebooting or RDP are not the supported investigation methods.',
  },
  {
    id: 'D5-03',
    domain: 'Optimize Operations',
    question: 'What is the difference between the "Device compliance" report and the "Device configuration policy status" report in Intune?',
    options: [
      'They are the same report with different names',
      'Device compliance shows whether devices meet compliance policy requirements; configuration policy status shows the assignment and applicability status of configuration profiles',
      'Configuration policy status shows compliance; device compliance shows profile installation status',
      'Device compliance is for Windows only; configuration policy status is for all platforms',
    ],
    correct: 1,
    explanation: 'The "Device compliance" report (under Reports → Device compliance) shows the compliance state of devices against compliance policies (compliant, non-compliant, in grace period). The "Device configuration policy status" report shows the installation and applicability status of configuration profiles (e.g., succeeded, failed, not applicable) per device. They address different aspects: compliance vs. configuration delivery.',
  },
  {
    id: 'D5-04',
    domain: 'Optimize Operations',
    question: 'How do Security Copilot agents in Intune assist with device performance analysis?',
    options: [
      'They replace Intune entirely and manage devices autonomously',
      'They analyze device performance data, identify anomalies and issues, and provide recommendations that administrators can review and act on',
      'They only generate audit logs and do not provide analysis',
      'They configure device configuration profiles automatically without administrator input',
    ],
    correct: 1,
    explanation: 'Security Copilot agents in Intune analyze device performance data, detect anomalies, identify potential issues (e.g., slow app startup, high CPU, disk issues), and provide recommendations that administrators review and act on. They do not replace Intune; they do not only generate logs; they do not act autonomously without administrator review.',
  },
  {
    id: 'D5-05',
    domain: 'Optimize Operations',
    question: 'You want to set up an alert that notifies the IT team when any device falls out of compliance within 1 hour. Where in Intune do you configure this?',
    options: [
      'In the Device compliance → Compliance policies blade, per policy',
      'In Intune → Alerts and notifications (or Microsoft Graph alert rules) to create an alert rule for compliance drift, with email/toast notification',
      'In the Microsoft 365 admin center → Service health',
      'Alerts for compliance are not configurable; you must poll the compliance report manually',
    ],
    correct: 1,
    explanation: 'Intune provides alerts and notifications (via the Intune admin center or Graph API alert rules) where you can configure alert rules for events such as compliance drift, enrollment failures, and configuration conflicts. You can set up notifications (email, in-tray) when devices fall out of compliance. Per-policy alerting and service health do not cover this; compliance alerts are configurable, not manual-only.',
  },
  {
    id: 'D5-06',
    domain: 'Optimize Operations',
    question: 'Which Intune feature provides device health scores and app startup performance metrics to help identify slow or unreliable devices?',
    options: [
      'Proactive remediations',
      'Endpoint Analytics (Endpoint analytics → Device health, App startup performance)',
      'Device compliance policies',
      'Microsoft Defender for Endpoint',
    ],
    correct: 1,
    explanation: 'Endpoint Analytics in Intune provides device health scores, app startup performance metrics, and reliability data (startup time, restart frequency, app crash rates). Proactive remediations are scripts that fix issues; compliance policies evaluate policy state; Defender for Endpoint focuses on security threats. Only Endpoint Analytics provides the health and performance scoring described.',
  },
  {
    id: 'D5-07',
    domain: 'Optimize Operations',
    question: 'You need to extend device compliance evaluation by running a custom PowerShell script that checks a specific registry key. How do you integrate this with Intune compliance?',
    options: [
      'Upload the script as a Win32 app and mark it as a compliance dependency',
      'Use a custom compliance script (device compliance → Scripts) or use Proactive Remediation + a custom compliance policy that evaluates the script output',
      'Add the registry check to an existing configuration profile',
      'Compliance policies cannot use custom scripts; this is not possible in Intune',
    ],
    correct: 1,
    explanation: 'Intune allows extending compliance via custom scripts (device compliance → Scripts / custom compliance) where a PowerShell script runs on the device and returns a compliance state based on its output. Alternatively, proactive remediation scripts can detect issues, and a compliance policy can be built around custom criteria. Adding a registry check to a configuration profile configures a setting but does not extend compliance evaluation logic. Custom script-based compliance IS possible in Intune.',
  },
];

// ─── Assessment State ─────────────────────────────────────────────────────────
const TOTAL_QUESTIONS = QUESTION_BANK.length;

export default function App() {
  const [phase, setPhase] = useState('intro'); // intro | exam | review
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(100 * 60); // 100 min in seconds
  const [timerPaused, setTimerPaused] = useState(false);

  // Timer
  useEffect(() => {
    if (phase !== 'exam' || timerPaused) return;
    if (timeRemaining <= 0) {
      setPhase('review');
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, timerPaused, timeRemaining]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const currentQ = QUESTION_BANK[index];

  const handleAnswer = useCallback((optIndex) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optIndex }));
    setShowExplanation(true);
  }, [currentQ]);

  const handleNext = () => {
    if (index < TOTAL_QUESTIONS - 1) {
      setIndex((i) => i + 1);
      setShowExplanation(false);
    } else {
      setPhase('review');
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setIndex(0);
    setAnswers({});
    setShowExplanation(false);
    setTimeRemaining(100 * 60);
  };

  const score = Object.entries(answers).filter(([, v]) => v === QUESTION_BANK.find((q) => q.id === Object.keys(answers).find((k) => k === Object.keys(answers)[0])).correct).length;
  // recalc properly:
  const correctCount = Object.entries(answers).reduce((acc, [qId, selected]) => {
    const q = QUESTION_BANK.find((q) => q.id === qId);
    if (q && selected === q.correct) return acc + 1;
    return acc;
  }, 0);

  const answeredCount = Object.keys(answers).length;

  // Score as percentage (Microsoft uses 700/1000 = 70%)
  // We map correct% → scaled score (simple linear: 0% = 0, 100% = 1000, but floor at 0)
  const scaledScore = Math.round((correctCount / TOTAL_QUESTIONS) * 1000);
  const passed = scaledScore >= 700;

  // Domain breakdown
  const domainStats = QUESTION_BANK.reduce((acc, q) => {
    const answered = answers[q.id];
    const isCorrect = answered !== undefined && answered === q.correct;
    if (!acc[q.domain]) acc[q.domain] = { total: 0, correct: 0, incorrect: 0, unanswered: 0 };
    acc[q.domain].total++;
    if (answered === undefined) acc[q.domain].unanswered++;
    else if (isCorrect) acc[q.domain].correct++;
    else acc[q.domain].incorrect++;
    return acc;
  }, {});

  const domainRows = Object.entries(domainStats).map(([name, stats]) => {
    const pct = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    return { name, ...stats, pct };
  });

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="header">
        <div className="header-brand">
          <span className="brand-dot" />
          <span className="brand-text">MD-102 Practice Assessment</span>
        </div>
        {phase === 'exam' && (
          <div className="header-timer">
            <span className={`timer-icon ${timeRemaining < 600 ? 'urgent' : ''}`}>
              {timeRemaining < 600 ? '⚠' : '⏱'}
            </span>
            <span className={`timer-value ${timeRemaining < 600 ? 'urgent' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </header>

      {/* ── Progress Bar ─────────────────────────────────────────────────────── */}
      {phase === 'exam' && (
        <div className="progress-section">
          <div className="progress-label">
            <span>Question {index + 1} of {TOTAL_QUESTIONS}</span>
            <span>
              {answeredCount} answered
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(answeredCount / TOTAL_QUESTIONS) * 100}%` }}
            />
          </div>
          <div className="domain-strip">
            {domainRows.map((d) => (
              <div
                key={d.name}
                className="domain-chip"
                title={`${d.name}: ${d.correct}/${d.total} correct`}
              >
                <span className="domain-chip-name">{d.name.split(' ')[0]}</span>
                <span className="domain-chip-score">
                  {d.correct}/{d.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Intro Screen ─────────────────────────────────────────────────────── */}
      {phase === 'intro' && (
        <main className="screen intro-screen">
          <div className="intro-card">
            <div className="intro-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Microsoft 365 Certified: Endpoint Administrator Associate
            </div>
            <h1 className="intro-title">
              Exam MD-102<br />
              <span className="intro-sub">Practice Assessment</span>
            </h1>
            <p className="intro-desc">
              This simulated assessment mirrors the style and difficulty of the
              official Microsoft Learn practice assessment for MD-102. It covers
              all five skill domains with 28 multiple-choice questions.
            </p>

            <div className="intro-stats">
              <div className="intro-stat">
                <span className="intro-stat-value">{TOTAL_QUESTIONS}</span>
                <span className="intro-stat-label">Questions</span>
              </div>
              <div className="intro-stat">
                <span className="intro-stat-value">100 min</span>
                <span className="intro-stat-label">Time limit</span>
              </div>
              <div className="intro-stat">
                <span className="intro-stat-value">700 / 1000</span>
                <span className="intro-stat-label">Passing score</span>
              </div>
              <div className="intro-stat">
                <span className="intro-stat-value">5</span>
                <span className="intro-stat-label">Domains</span>
              </div>
            </div>

            <div className="intro-weight-table">
              <table>
                <thead>
                  <tr>
                    <th>Skill Domain</th>
                    <th>Weight</th>
                    <th># Questions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Prepare Infrastructure for Devices', '20–25%'],
                    ['Manage and Maintain Devices', '25–30%'],
                    ['Protect Devices', '15–20%'],
                    ['Manage and Secure Applications', '15–20%'],
                    ['Optimize Endpoint Operations', '10–15%'],
                  ].map(([domain, weight], i) => {
                    const count = QUESTION_BANK.filter((q) => q.domain === domain).length;
                    return (
                      <tr key={i}>
                        <td>{domain}</td>
                        <td>{weight}</td>
                        <td>{count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="intro-rules">
              <h2>Assessment rules</h2>
              <ul>
                <li>One correct answer per question — select the <em>best</em> answer.</li>
                <li>You may navigate between questions using Previous / Next.</li>
                <li>A timer counts down from 100 minutes. Unanswered questions count as incorrect.</li>
                <li>After submission, you will see your score, domain breakdown, and explanations for every question.</li>
                <li>This is a study tool — answers and explanations are shown after each question and in the review screen.</li>
              </ul>
            </div>

            <button className="btn btn-primary btn-lg" onClick={() => setPhase('exam')}>
              Begin Assessment
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </main>
      )}

      {/* ── Exam Screen ──────────────────────────────────────────────────────── */}
      {phase === 'exam' && (
        <main className="screen exam-screen">
          <div className="q-card">
            <div className="q-domain-tag">
              <span className="domain-dot" />
              {currentQ.domain}
            </div>

            <h2 className="q-text">{currentQ.question}</h2>

            <fieldset className="q-options">
              {currentQ.options.map((opt, i) => {
                const selected = answers[currentQ.id] === i;
                const isCorrect = i === currentQ.correct;
                const showResult = showExplanation && answers[currentQ.id] !== undefined;

                return (
                  <label
                    key={i}
                    className={`q-option ${selected ? 'selected' : ''} ${showResult && isCorrect ? 'correct' : ''} ${showResult && selected && !isCorrect ? 'wrong' : ''}`}
                    onClick={() => handleAnswer(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="q-option-radio">
                      {showResult && isCorrect && <span className="q-option-check">✓</span>}
                      {selected && <span className="q-option-fill" />}
                    </span>
                    <span className="q-option-label">{String.fromCharCode(65 + i)}</span>
                    <span className="q-option-text">{opt}</span>
                  </label>
                );
              })}
            </fieldset>

            {showExplanation && answers[currentQ.id] !== undefined && (
              <div className="q-explanation">
                <div className="q-expl-header">
                  {answers[currentQ.id] === currentQ.correct ? (
                    <span className="q-expl-badge correct-badge">Correct</span>
                  ) : (
                    <span className="q-expl-badge wrong-badge">
                      Incorrect — your answer: {String.fromCharCode(65 + answers[currentQ.id])}
                    </span>
                  )}
                  <span className="q-expl-correct">
                    Correct answer: <strong>{currentQ.options[currentQ.correct]}</strong>
                  </span>
                </div>
                <p className="q-expl-body">{currentQ.explanation}</p>
              </div>
            )}

            <div className="q-nav">
              <button
                className="btn btn-ghost"
                onClick={handlePrev}
                disabled={index === 0}
              >
                ← Previous
              </button>
              <div className="q-nav-right">
                <span className="q-nav-progress">
                  {answeredCount} of {TOTAL_QUESTIONS} answered
                </span>
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                >
                  {index < TOTAL_QUESTIONS - 1 ? 'Next →' : 'Submit Assessment'}
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>

            {showExplanation && (
              <div className="q-nav-hint">
                You can review this explanation and move to the next question.
              </div>
            )}
          </div>
        </main>
      )}

      {/* ── Review Screen ─────────────────────────────────────────────────────── */}
      {phase === 'review' && (
        <main className="screen review-screen">
          <div className="review-card">
            {/* Score summary */}
            <div className="review-score-section">
              <div className={`review-score-badge ${passed ? 'pass' : 'fail'}`}>
                {passed ? 'PASS' : 'NOT PASSED'}
              </div>
              <div className="review-score-value">
                <span className="review-score-number">{scaledScore}</span>
                <span className="review-score-max">/ 1000</span>
              </div>
              <p className="review-score-label">
                {passed
                  ? 'You passed the practice assessment. Continue studying to reinforce your knowledge before the real exam.'
                  : 'You did not reach the passing threshold. Review the explanations below and restudy the domains with the lowest scores.'}
              </p>
              <div className="review-score-detail">
                <span>{correctCount} / {TOTAL_QUESTIONS} correct</span>
                <span>{answeredCount} / {TOTAL_QUESTIONS} answered</span>
                <span>{TOTAL_QUESTIONS - answeredCount} unanswered (counted as incorrect)</span>
              </div>
            </div>

            {/* Domain breakdown */}
            <div className="review-section">
              <h3 className="review-section-title">Domain Breakdown</h3>
              <div className="review-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Correct</th>
                      <th>Incorrect</th>
                      <th>Unanswered</th>
                      <th>Total</th>
                      <th>Score</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainRows.map((d) => (
                      <tr key={d.name} className={d.pct < 60 ? 'row-warn' : ''}>
                        <td>{d.name}</td>
                        <td>{d.correct}</td>
                        <td>{d.incorrect}</td>
                        <td>{d.unanswered}</td>
                        <td>{d.total}</td>
                        <td>
                          <div className="mini-bar">
                            <div
                              className="mini-bar-fill"
                              style={{ width: `${d.pct}%` }}
                            />
                          </div>
                          <span className="mini-bar-label">{d.pct}%</span>
                        </td>
                        <td>
                          {d.pct >= 75 ? '✅' : d.pct >= 50 ? '⚠️' : '🔴'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Per-question review */}
            <div className="review-section">
              <h3 className="review-section-title">Question Review</h3>
              <div className="review-q-list">
                {QUESTION_BANK.map((q, i) => {
                  const selected = answers[q.id];
                  const isCorrect = selected === q.correct;
                  const qIndex = i;

                  return (
                    <div
                      key={q.id}
                      className={`review-q-item ${isCorrect ? 'q-correct' : selected === undefined ? 'q-unanswered' : 'q-wrong'}`}
                    >
                      <div className="review-q-header">
                        <span className="review-q-num">Q{qIndex + 1}</span>
                        <span className="review-q-domain">{q.domain}</span>
                        <span className={`review-q-result ${isCorrect ? 'result-correct' : selected === undefined ? 'result-unanswered' : 'result-wrong'}`}>
                          {isCorrect ? 'Correct' : selected === undefined ? 'Unanswered' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="review-q-text">{q.question}</p>
                      <div className="review-q-answers">
                        {q.options.map((opt, oi) => {
                          const isTheCorrect = oi === q.correct;
                          const isSelected = selected === oi;
                          return (
                            <div
                              key={oi}
                              className={`review-q-opt ${isTheCorrect ? 'opt-correct' : ''} ${isSelected && !isTheCorrect ? 'opt-wrong' : ''}`}
                            >
                              <span className="review-q-opt-label">{String.fromCharCode(65 + oi)}</span>
                              <span className="review-q-opt-text">
                                {opt}
                                {isTheCorrect && <span className="opt-correct-mark"> ✓</span>}
                                {isSelected && !isTheCorrect && <span className="opt-wrong-mark"> ✗</span>}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <details className="review-q-details">
                        <summary>Explanation</summary>
                        <p className="review-q-expl">{q.explanation}</p>
                      </details>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="review-actions">
              <button className="btn btn-primary btn-lg" onClick={handleRestart}>
                ← Retry Assessment
              </button>
              <a
                className="btn btn-ghost"
                href="/MD-102_Study_Guide.md"
                target="_blank"
                rel="noopener"
              >
                Open Study Guide
              </a>
            </div>
          </div>
        </main>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="footer">
        <span>MD-102 Practice Assessment · Study tool · Not affiliated with Microsoft</span>
      </footer>
    </div>
  );
}
