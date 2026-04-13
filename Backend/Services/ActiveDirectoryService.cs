using System.DirectoryServices.AccountManagement;
using System.Collections.Generic;
using System;

namespace KtcWeb.Services
{
    public class ActiveDirectoryService
    {
        private readonly string dcIpOrName = "172.27.124.0";

        /// <summary>
        /// Authentifie l'utilisateur contre Active Directory
        /// </summary>
        public bool Authenticate(string username, string password)
        {
            try
            {
                Console.WriteLine($"[DEBUG Auth] Tentative pour {username}");

                using (var context = new PrincipalContext(ContextType.Domain, dcIpOrName))
                {
                    bool success = context.ValidateCredentials(username, password, ContextOptions.SimpleBind);
                    if (!success)
                        success = context.ValidateCredentials(username, password);

                    Console.WriteLine($"[DEBUG Auth] Résultat : {success}");
                    return success;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AD Auth ERROR] {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"   Inner: {ex.InnerException.Message}");
                return false;
            }
        }

        /// <summary>
        /// Récupère les rôles de l'utilisateur (version propre avec credentials)
        /// </summary>
        public List<string> GetRoles(string username, string password)
        {
            var roles = new List<string>();

            try
            {
                Console.WriteLine($"[DEBUG GetRoles] Recherche pour {username}");

                using (var context = new PrincipalContext(ContextType.Domain, dcIpOrName, username, password))
                {
                    var user = UserPrincipal.FindByIdentity(context, IdentityType.SamAccountName, username);

                    if (user == null)
                    {
                        Console.WriteLine($"[DEBUG] User {username} non trouvé");
                        return roles;
                    }

                    var authGroups = user.GetAuthorizationGroups();

                    foreach (var group in authGroups)
                    {
                        if (group != null && !string.IsNullOrEmpty(group.Name))
                        {
                            string groupName = group.Name.Trim();

                            // On garde seulement les groupes métier (on ignore les groupes par défaut)
                            if (groupName != "Utilisateurs du domaine" &&
                                groupName != "Utilisateurs" &&
                                groupName != "Domain Users" &&
                                groupName != "Everyone" &&
                                !groupName.StartsWith("CN="))
                            {
                                roles.Add(groupName);
                                Console.WriteLine($"[DEBUG] Groupe métier : {groupName}");
                            }
                            else
                            {
                                Console.WriteLine($"[DEBUG] Groupe ignoré : {groupName}");
                            }
                        }
                    }

                    if (roles.Count == 0)
                    {
                        roles.Add("Utilisateur");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AD GetRoles ERROR] {ex.Message}");
                if (ex.InnerException != null)
                    Console.WriteLine($"   Inner: {ex.InnerException.Message}");
            }

            Console.WriteLine($"[DEBUG GetRoles] Rôles finaux : [{string.Join(", ", roles)}]");
            return roles;
        }
    }
}