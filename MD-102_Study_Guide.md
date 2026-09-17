# MD-102: Endpoint Administrator Associate — Study Guide

**Last Exam Update:** July 24, 2026  
**Passing Score:** 700 / 1000  
**Duration:** 100 minutes  
**Cost:** $165 USD

---

## Exam Skills at a Glance

| Domain | Weight | Core Focus |
|---|---|---|
| Prepare Infrastructure for Devices | 20–25% | Entra ID join/register, Intune enrollment, identity & compliance, LAPS, WHfB |
| Manage and Maintain Devices | 25–30% | Autopilot, Windows 365, AVD, config profiles, Intune Suite, remote actions |
| Protect Devices | 15–20% | Defender for Endpoint, BitLocker, firewall, ASR, update rings, Autopatch |
| Manage and Secure Applications | 15–20% | Win32/LOB/Store app deployment, MAM/MDM policies, M365 Apps, ODT |
| Optimize Endpoint Operations | 10–15% | Graph/PowerShell automation, Security Copilot agents, reporting, proactive remediations |

---

## Domain 1: Prepare Infrastructure for Devices (20–25%)

### Modules (Learning Path: `prepare-infrastructure-devices-intune-microsoft-entra-id`)

| Module | Time | Key Topics |
|---|---|---|
| Understand endpoint management strategies and Microsoft Intune | 55 min | MDM vs. MCM, co-management, Intune architecture, Entra ID role |
| Configure Microsoft Entra ID for device and policy management | 55 min | Users/groups, RBAC roles, dynamic group membership rules, device registration settings |
| Administer device identity and authentication using Microsoft Entra ID | 55 min | Join types (Entra, hybrid, register), key trust / certificate trust / TPM, device trust validation |
| Plan and implement device enrollment using Microsoft Intune | 60 min | Windows auto-enrollment, macOS/iOS via Apple Business Manager, Android (FK, COPE, WPE), Knox/Zero Touch, enrollment restrictions, troubleshooting |
| Deploy Windows devices using Windows Autopilot | 59 min | Deployment modes (user-driven, pre-provisioning, self-deploying), device naming templates, ESP, profile assignment, troubleshooting |

### Key Commands & Concepts

**Dynamic group membership rule examples:**
```
(device.deviceId -eq "<deviceId>")
(device.displayName -contains "SLT*")
(user.department -eq "Sales")
```

**Enrollment restriction PowerShell (Graph):**
```powershell
# Block personal iOS devices from enrolling
POST https://graph.microsoft.com/v1.0/deviceManagement/deviceEnrollmentRestrictions
{
  "displayName": "Block Personal iOS",
  "enrollmentType": "ios",
  "platformType": "iOS",
  "isBroadTargetingEnabled": false,
  "rules": [{ "ruleType": "device jailbreak", "compareOperation": "eq", "value": "true" }]
}
```

**Entra ID device join via PowerShell (on-device):**
```powershell
# Entra join (cloud-only)
dsregcmd /join

# Check join state
dsregcmd /status
```

**LAPS CSP policy (Intune OMA-URI):**
```
./Device/Vendor/MSFT/Policy/Config/LAPSPolicy/ConfigureLAPS
```

---

## Domain 2: Manage and Maintain Devices (25–30%)

### Official Learning Paths

| Learning Path | Duration | Modules |
|---|---|---|
| [Manage and maintain devices using Microsoft Intune](https://learn.microsoft.com/en-us/training/paths/manage-maintain-devices-intune/) | 3h 56m | 4 modules — config profiles, Intune Suite, remote actions |
| [Deliver cloud-hosted desktops using Azure Virtual Desktop and Windows 365](https://learn.microsoft.com/en-us/training/paths/deliver-cloud-hosted-desktops/) | 3h 15m | 4 modules — W365 provisioning policies, AVD host pools, image management |

### Device Configuration Profiles

- **Platforms:** Windows (ADMX import + Group Policy analytics), Android, iOS/iPadOS, macOS, specialty (Teams Rooms, HoloLens 2, Zebra)
- **Assignment filters** — target by device property, OS version, enrollment time grouping
- **Settings Catalog** — unified settings surface replacing scattered profile types

**Create a configuration profile via Graph:**
```http
POST https://graph.microsoft.com/v1.0/deviceManagement/deviceConfigurationProfiles
{
  "displayName": "Disable USB Storage - Windows",
  "description": "Blocks removable USB storage via ADMX",
  "platforms": "windows10AndLater",
  "technologies": "windows10AndLater",
  "templateReference": {
    "templateId": "admx_win10_software_restrictions",
    "version": "10.0.0"
  },
  "settings": [...],
  "assignments": [{ "target": { "groupTag": "HR-Devices" } }]
}
```

**Import ADMX into Intune (PowerShell/Graph path):**
```powershell
# Upload ADMX files via Intune admin center or Graph:
POST /deviceManagement/deviceManagementAdmxFiles
```

### Intune Suite Add-On Capabilities

| Capability | What it does |
|---|---|
| **Endpoint Privilege Management (EPM)** | Elevation policies, pseudonyms, monitoring elevated actions, Just-In-Time elevation |
| **Enterprise App Catalog** | Centrally managed app store for line-of-business apps |
| **Intune Remote Help** | Secure remote assistance sessions integrated with Entra ID |
| **Microsoft Cloud PKI** | Cloud-based CA, automated cert issuance, cert health monitoring |
| **Microsoft Tunnel for MAM** | VPN-less access for MAM-only managed apps |
| **Intune Advanced Analytics** | Anomaly detection, proactive insights, risk-based policy recommendations |

### Remote Actions

- **Device actions:** Sync, restart, retire, wipe (full vs. factory), bulk actions
- **BitLocker:** Rotate recovery keys
- **Locate:** Rotate locate admin password
- **KQL device query:** `DeviceTvmSoftwareInventory`, `DeviceProcessEvents`, etc.
- **Diagnostics:** Troubleshooting blade, user-based diagnostics collection

---

## Domain 3: Protect Devices (15–20%)

### Learning Path: [Protect devices using Microsoft Intune](https://learn.microsoft.com/en-us/training/paths/protect-devices-intune/)
**Duration:** 5h 2m — 6 modules

### Endpoint Security — Policy Types

| Policy Type | Configured In | Key Settings |
|---|---|---|
| **Antivirus** (Microsoft Defender AV) | Endpoint security → Antivirus | Real-time protection, cloud-delivered protection, scan schedule, exclusions |
| **Disk Encryption** (BitLocker) | Endpoint security → Disk encryption | TPM + PIN, recovery key storage (Entra ID), user self-service recovery, encryption compliance |
| **Firewall** | Endpoint security → Firewall | Inbound/outbound rules, app-based rules, port/protocol rules |
| **Attack Surface Reduction (ASR)** | Endpoint security → Attack surface reduction | Rules in audit/enforce mode, Zero Trust posture, common ruleset |
| **Security Baselines** | Endpoint security → Security baselines | Microsoft recommended baselines (Windows 10/11, Defender, Edge) |
| **App Control for Business** | App Control → Policies | Code integrity policies, file rules, publisher rules, deployment modes |

### BitLocker — Key Management

```powershell
# Backup BitLocker recovery key to Entra ID (on-device)
BackupToAAD-BitLockerKeyProtector -RecoveryPasswordProtectorId <keyProtectorId>
```

**Graph API — recover BitLocker key:**
```http
GET https://graph.microsoft.com/v1.0/devices/{id}/microsoft.graph.bitLockerRecoveryKey
```

### Microsoft Defender for Endpoint Integration

- **Onboarding:** Intune onboarding package (Windows 10/11), Linux, macOS
- **EDR policies:** Configure via Intune Endpoint security → Defender for Endpoint
- **Threat investigation:** Incident queue, alerts, device timeline, KQL queries in Microsoft Defender portal
- **Automated investigation & remediation (AIR):** Aggressive vs. passive modes

**Onboarding command (Windows):**
```powershell
# Download onboarding package from securitycenter.microsoft.com
# Deploy via Intune script or configuration profile
& "WindowsDefenderAdvancedThreatProtectionInstaller.exe" /Mode <onboarding|uninstall> /TenantId <entraid>
```

### Update Rings & Autopatch

- **Update rings:** Feature updates, quality updates, deferral periods, active hours, restart behavior
- **Windows Autopatch:** Automated ring management, driver updates, app updates, exception rings
- **Hotpatch:** Capability for specific Windows 11 editions
- **Delivery Optimization:** Peer-to-peer, download modes, band-bandwidth throttling
- **iOS/macOS updates:** Settings Catalog policies for OS update deferral
- **Android FOTA:** Firmware-over-the-air via manufacturer partners (Samsung, etc.)

**Create update ring (Graph):**
```http
POST https://graph.microsoft.com/v1.0/deviceManagement/deviceUpdateConfigurations
{
  "@odata.type": "#microsoft.graph.windowsUpdateRing",
  "displayName": "Production Ring 1",
  "fastScanTimeInMinutes": 60,
  "deviceRestartSignoffNotificationDisplayTimeInMinutes": 15,
  "prereleaseFeatures": "none",
  "qualityUpdateDeferralPeriodInDays": 5,
  "featureUpdateDeferralPeriodInDays": 60
}
```

---

## Domain 4: Manage and Secure Applications (15–20%)

### Learning Paths

| Learning Path | Duration | Modules |
|---|---|---|
| [Manage applications using Microsoft Intune](https://learn.microsoft.com/en-us/training/paths/manage-applications-intune/) | 4h 45m | 5 modules — Win32/LOB/Store, M365 Apps (ODT), app deployment monitoring |
| (embedded in exam) | — | Plan/app protection policies (MAM), app configuration policies (MAM/MDM), Conditional Access for MAM |

### App Deployment Types

| Type | Intune Support | Notes |
|---|---|---|
| **Win32** (.intunewin) | Full | Detection rules, dependencies, supersedence, requirements, assignments, quiet time |
| **Line-of-Business (LOB)** | Full | MSI, EXE with silent install, scripts |
| **Microsoft Store / VPP** | Yes | Apple Volume Purchase Program, Google Play for Work/EMUI, private store links |
| **Web Apps** | Yes | SSO, link-based, no device install |

### Microsoft 365 Apps Deployment

- **Office Deployment Tool (ODT):** `setup.exe /configure client.xml`
- **Intune ODT integration:** Push custom XML config, configure update channels
- **Microsoft 365 Apps Admin Center:** Shared computer activation, app settings, update management
- **Autopilot integration:** Pre-load M365 Apps during OOBE

**Sample ODT `configuration.xml`:**
```xml
<Configuration>
  <Add OfficeClientEdition="64" Channel="MonthlyEnterprise">
    <Product ID="O365ProPlusRetail">
      <Language ID="en-us" />
    </Product>
  </Add>
  <Updates Enabled="TRUE" Channel="MonthlyEnterprise" />
  <Display Level="None" AcceptEULA="TRUE" />
</Configuration>
```

### App Protection Policies (MAM)

- **Target:** Managed devices (MDM enrolled) AND unmanaged/BYOD devices
- **Policy types:** Data protection (copy/paste, save-as, encrypt), app configuration (server settings, licensing)
- **Conditional Access for MAM:** Require app protection policy compliance before granting access
- **iOS/Android:** Intune managed apps SDK, policy applicability

**Graph — list app protection policies:**
```http
GET https://graph.microsoft.com/v1.0/deviceManagement/deviceAppManagement/mobileAppProvisioningConfigs
GET https://graph.microsoft.com/v1.0/deviceManagement/deviceAppManagement/iosManagedAppProtections
GET https://graph.microsoft.com/v1.0/deviceManagement/deviceAppManagement/androidManagedAppProtections
```

### App Configuration Policies

- Push app settings to managed apps without MDM enrollment (MAM scenario)
- Platform-specific config (iOS managed app config, Android key-value pairs)
- Use cases: Exchange ActiveSync settings, VPN profiles, SSO broker config

---

## Domain 5: Optimize Endpoint Operations (10–15%)

### Learning Path: [Automate and optimize endpoint management using Microsoft Intune](https://learn.microsoft.com/en-us/training/paths/automate-optimize-endpoint-management-intune/)
**Duration:** 2h 36m — 3 modules

### Plus: [Support operational excellence and readiness using Microsoft Intune](https://learn.microsoft.com/en-us/training/paths/support-operational-excellence-intune/)
**Duration:** 2h 15m — 3 modules

### Automation — PowerShell + Microsoft Graph

**Authenticate to Graph with Intune permissions:**
```powershell
Connect-MgGraph -Scopes "DeviceManagementConfiguration.ReadWrite.All", "DeviceManagementManagedDevices.ReadWrite.All", "DeviceManagementApps.ReadWrite.All"
```

**List all enrolled devices:**
```powershell
Get-MgDeviceManagementManagedDevice -All | Select-Object deviceName, platform, emailAddress, osVersion, complianceState
```

**Bulk sync all Windows devices:**
```powershell
$devices = Get-MgDeviceManagementManagedDevice -Filter "platform eq 'windows'"
foreach ($d in $devices) {
    New-MgDeviceManagementManagedDeviceSyncAction -ManagedDeviceId $d.Id -SyncAction "sync"
}
```

**Export compliance report (Graph report API):**
```powershell
$report = Invoke-MgGraphRequest -Method GET -Uri "https://graph.microsoft.com/beta/deviceManagement/exportJobs/{jobId}/report"
```

**Available report names include:** `DeviceCompliance`, `DeviceComplianceTrend`, `DeviceConfigurationPolicyStatuses`, `DevicePoliciesComplianceReport`, `DeviceEnrollmentFailures`, `NoncompliantDevicesAndSettings`, `AutopilotV1DeploymentStatus`, etc.

**Automation scenarios covered in exam:**
- Create and assign Intune policies via Graph or PowerShell (device config, compliance, app configs)
- Extend device compliance with custom PowerShell scripts
- Automate schedule/conditions via Graph webhooks or automation accounts
- Investigate threats via Security Copilot agents in Intune
- Analyze device performance via Security Copilot

### Monitoring & Reporting

| Feature | What it tracks |
|---|---|
| **Intune Reports hub** | Compliance, configuration, app deployment, enrollment failures |
| **Workbooks & Dashboards** | Custom Azure Monitor workbooks, device compliance dashboard |
| **Endpoint Analytics** | Proactive remediations (detect/fix scripts), device health scores, app startup performance |
| **Proactive remediations** | Scheduled PowerShell scripts: detection script + remediation script, run frequency, device-group targeting |
| **Tenant health** | Service health dashboard, message center, baseline establishment |
| **Alerts/notifications** | Alert rules for compliance drift, enrollment failures, configuration conflicts |

**Sample proactive remediation detection script (PowerShell):**
```powershell
# Detect low disk space on C:
$disk = Get-PSDrive -Name C
$freespaceMB = [math]::Round($disk.Free / 1MB, 2)
if ($freespaceMB -lt 5000) {
    Write-Output "CRITICAL: Free space = $freespaceMB MB"
    exit 1  # Non-compliant
}
exit 0  # Healthy
```

---

## Review Questions — Active Recall

### Domain 1
1. A device shows as "Hybrid Azure AD joined" but is not appearing in Intune. What is the most likely cause and how do you troubleshoot?
2. You need to enroll 500 corporate-owned Android devices without user interaction. Which enrollment method do you choose, and what backend service must be integrated?
3. Dynamic group rule: create a membership rule that includes all devices where the `deviceId` starts with "CORP-". Write the rule.
4. What are the three Windows Autopilot deployment modes, and which one requires zero user interaction?
5. How does Windows Hello for Business authentication differ when using key trust vs. certificate trust?

### Domain 2
6. You need to enforce a GPO that already exists as an ADMX file in on-prem AD. How do you bring it into Intune, and what tool helps you analyze overlap?
7. Enterprise App Catalog vs. Intune Company Portal — what is the key functional difference?
8. A device needs a remote wipe but the user's data must be preserved for forensic purposes. Which remote action do you use?
9. What is Microsoft Tunnel for MAM, and when would you use it over a traditional full-device VPN profile?
10. How do enrollment time grouping and assignment filters differ in how they target configuration profiles?

### Domain 3
11. You've enabled BitLocker but recovery keys are not appearing in Entra ID. What are two possible causes?
12. An ASR rule is deployed in Audit mode and you see 200 events in the security log. What is the next step before switching to Block mode?
13. You need to ensure a critical security update is deployed within 48 hours to all Windows 11 devices while deferring all other updates. Which Intune feature do you use?
14. What is the difference between Windows Autopatch and a manually created update ring?
15. How do you verify that Defender for Endpoint has successfully onboarded a device?

### Domain 4
16. You need to deploy a custom Win32 app that requires a pre-requisite .NET runtime. How do you model this in Intune?
17. A BYOD user needs access to corporate email on iOS without enrolling the device in MDM. Which Intune feature do you configure, and what data protection setting would prevent copy/paste to personal apps?
18. How does the Office Deployment Tool (ODT) integrate with Intune for Windows Autopilot deployments?
19. What is the purpose of "Quiet Time" in app deployment, and on which platforms is it available?
20. Conditional Access policy requires app protection policy compliance. Does this apply to MDM-managed devices, unmanaged devices, or both?

### Domain 5
21. You need to programmatically create 50 configuration profiles for 50 branch offices. Which API/tool do you use, and what permission scope is required?
22. A proactive remediation script is failing on 10% of devices. How do you investigate the failure and re-run it?
23. What is the difference between the "Device compliance" report and the "Device configuration policy status" report?
24. How do Security Copilot agents in Intune assist with device performance analysis?
25. You need to set up an alert that fires when any device falls out of compliance within 1 hour. Where in Intune do you configure this?

---

## Quick Reference — Intune Graph API Permission Scopes

| Scope | Description |
|---|---|
| `DeviceManagementConfiguration.Read.All` | Read device configuration profiles, policies |
| `DeviceManagementConfiguration.ReadWrite.All` | Create/update config & compliance policies |
| `DeviceManagementManagedDevices.Read.All` | List/managed devices, diagnostics |
| `DeviceManagementManagedDevices.ReadWrite.All` | Remote actions (sync, wipe, restart) |
| `DeviceManagementApps.Read.All` | Read app deployments, app protection policies |
| `DeviceManagementApps.ReadWrite.All` | Deploy/update apps, MAM policies |

---

## Next Steps

1. **Hands-on tenant:** Use a Microsoft 365 dev tenant (or your org's test tenant). Enroll a Windows device via Windows Autopilot (user-driven mode). Deploy a BitLocker policy. Create a Win32 app package with `IntuneWinAppUtil.exe`.
2. **Graph practice:** Use Postman or PowerShell (`Connect-MgGraph`) to list devices, create a compliance policy, and query the `DeviceCompliance` report.
3. **Practice Assessment:** Take the official MD-102 practice assessment on Microsoft Learn (assessment ID 76).
4. **Exam scheduling:** Pearson VUE — register with a personal MSA, not an org AAD account.

---

*Generated: July 2025 (exam info current as of July 24, 2026 update)*  
*Source: [Microsoft Learn MD-102](https://learn.microsoft.com/en-us/credentials/certifications/exams/md-102/) | [Study Guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/md-102)*
