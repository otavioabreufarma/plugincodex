using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Oxide.Core;
using Oxide.Core.Configuration;
using Oxide.Core.Plugins;
using Oxide.Core.Libraries.Covalence;

namespace Oxide.Plugins
{
    [Info("VipIntegration", "PluginCodex", "1.0.0")]
    [Description("Integra VIP com backend externo para múltiplos servidores Rust.")]
    public class VipIntegration : CovalencePlugin
    {
        private PluginConfig _config;

        private class PluginConfig
        {
            public string ServerId = "server1";
            public string BackendUrl = "https://your-backend-subdomain.discloud.app";
            public string ApiToken = "super-secret-plugin-api-key";
            public int CheckInterval = 60;
        }

        protected override void LoadDefaultConfig()
        {
            _config = new PluginConfig();
            SaveConfig();
        }

        protected override void LoadConfig()
        {
            base.LoadConfig();
            try
            {
                _config = Config.ReadObject<PluginConfig>();
                if (_config == null)
                {
                    throw new Exception("Config file empty");
                }
            }
            catch
            {
                PrintWarning("Config inválida, gerando novo arquivo em config/VipIntegration.json");
                LoadDefaultConfig();
            }
        }

        protected override void SaveConfig() => Config.WriteObject(_config, true);

        [Command("vip.apply")]
        private void CmdVipApply(IPlayer player, string command, string[] args)
        {
            if (args.Length < 2)
            {
                player.Reply("Uso: vip.apply <discordId> <vip|vip+>");
                return;
            }

            var discordId = args[0];
            var vipType = args[1];

            if (vipType != "vip" && vipType != "vip+")
            {
                player.Reply("Tipo VIP inválido. Use vip ou vip+.");
                return;
            }

            var payload = JsonConvert.SerializeObject(new
            {
                serverId = _config.ServerId,
                discordId,
                vipType
            });

            SendBackendRequest("/plugin/vip/apply", payload, response =>
            {
                player.Reply($"Resposta backend (apply): {response}");
            });
        }

        [Command("vip.remove")]
        private void CmdVipRemove(IPlayer player, string command, string[] args)
        {
            if (args.Length < 1)
            {
                player.Reply("Uso: vip.remove <discordId>");
                return;
            }

            var payload = JsonConvert.SerializeObject(new
            {
                serverId = _config.ServerId,
                discordId = args[0]
            });

            SendBackendRequest("/plugin/vip/remove", payload, response =>
            {
                player.Reply($"Resposta backend (remove): {response}");
            });
        }

        [Command("vip.status")]
        private void CmdVipStatus(IPlayer player, string command, string[] args)
        {
            if (args.Length < 1)
            {
                player.Reply("Uso: vip.status <discordId>");
                return;
            }

            var url = $"{_config.BackendUrl}/plugin/vip/status?serverId={_config.ServerId}&discordId={args[0]}";

            webrequest.Enqueue(url, null, (code, response) =>
            {
                if (code != 200)
                {
                    player.Reply($"Falha ao buscar status. HTTP={code} Response={response}");
                    return;
                }

                player.Reply($"Status VIP: {response}");
            }, this, Core.Libraries.RequestMethod.GET, new Dictionary<string, string>
            {
                ["x-api-key"] = _config.ApiToken,
                ["Content-Type"] = "application/json"
            });
        }

        private void SendBackendRequest(string route, string payload, Action<string> onSuccess)
        {
            var url = $"{_config.BackendUrl}{route}";
            webrequest.Enqueue(url, payload, (code, response) =>
            {
                if (code < 200 || code >= 300)
                {
                    PrintError($"Erro backend. HTTP={code} Body={response}");
                    return;
                }

                onSuccess(response);
            }, this, Core.Libraries.RequestMethod.POST, new Dictionary<string, string>
            {
                ["x-api-key"] = _config.ApiToken,
                ["Content-Type"] = "application/json"
            });
        }
    }
}
