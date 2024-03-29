-- phpMyAdmin SQL Dump
-- version 5.0.4deb2+deb11u1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : mer. 27 mars 2024 à 00:00
-- Version du serveur :  8.0.35
-- Version de PHP : 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `easydae_bds`
--

-- --------------------------------------------------------

--
-- Structure de la table `form`
--

CREATE TABLE `form` (
  `id` int NOT NULL,
  `form_type` varchar(50) NOT NULL,
  `form_data` text NOT NULL,
  `form_statut` varchar(50) NOT NULL,
  `form_sentTo` varchar(50) NOT NULL,
  `form_sentToGroup` varchar(50) NOT NULL,
  `form_signedByAsso` varchar(50) DEFAULT NULL,
  `form_signedByAdmin` varchar(50) DEFAULT NULL,
  `form_pdf` varchar(100) DEFAULT NULL,
  `form_docx` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `users_email` varchar(50) NOT NULL,
  `users_username` varchar(50) NOT NULL,
  `users_nom` varchar(50) NOT NULL,
  `users_prenom` varchar(50) NOT NULL,
  `users_password` varchar(100) NOT NULL,
  `users_signature` varchar(50) DEFAULT NULL,
  `users_permissions` tinyint NOT NULL,
  `users_templateDAE` varchar(100) DEFAULT NULL,
  `users_groups_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`users_email`, `users_username`, `users_nom`, `users_prenom`, `users_password`, `users_signature`, `users_permissions`, `users_templateDAE`, `users_groups_name`) VALUES
('axel.stoltz@bds-efrei.fr.docx', 'Axel Stoltz - Natation', 'Stoltz', 'Axel', '$2b$10$9GLH7PhEd6F6qbQCzUIGg.sDf8otFAEselZerV1fIXTpp9HQiNaxu', NULL, 0, 'DAE_template_axel.stoltz@bds-efrei.fr.docx', 'Respos Sport'),
('constance.walusiak@bds-efrei.fr', 'Constance Walusiak - Pôle Communication', 'Walusiak', 'Constance', '$2b$10$jkuavZQzWKFCBmkv8ZQcveplgHtiZwPKC0h364rjG2ZHZKG25N682', NULL, 1, 'DAE_template_constance.walusiak@bds-efrei.fr.docx', 'Bureau'),
('gaspard.salluron@bds-efrei.fr', 'Gaspard Salluron - Vice Président', 'Salluron', 'Gaspard', '$2b$10$SeEI4DHfd5fla.RAha/2LOQwreCbImg8jfB0avxeQ.9/xu29DVBkO', NULL, 1, 'DAE_template_gaspard.salluron@bds-efrei.fr.docx', 'Bureau'),
('mael.aubert@bds-efrei.fr', 'Maël AUBERT - Respo Partenariat', 'Aubert', 'Maël', '$2a$12$schzg78cyR5MfR57YaviFeqkvzQVk2IP3Td8YqV6RZ4a19K4k2Ox6', NULL, 2, 'DAE_template_mael.aubert@bds-efrei.fr.docx', 'Bureau'),
('maelaubert56@gmail.com', 'Clémentine Silengo - Responsable vie associative', 'Silengo', 'Clémentine', '$2a$10$IlIjgq1QK6WKE9zFANqLvu.ZTxiCP9yH2DbzXOMOuA/a/KGQdYObO', NULL, 0, NULL, 'Responsables Vie Associative'),
('maelaubert76@gmail.com', 'Julien Talledo - Chargé de vie associative', 'Talledo', 'Julien', '$2a$10$0bI1xM0QgtZJRQioyCLok.7ZVc1o4rFfEkZs.w7KUCdym4xz27bPW', NULL, 0, NULL, 'Responsables Vie Associative'),
('marie.michot@bds-efrei.fr', 'Marie Michot - Vice Présidente', 'Michot', 'Marie', '$2b$10$vLYMbOqSTLiLWXG3b7cr/.XT8gKZUhdXMK6yxXpmNf9o2MTw6pIRK', NULL, 2, 'DAE_template_marie.michot@bds-efrei.fr.docx', 'Bureau'),
('marius.chevailler@bds-efrei.fr', 'Marius Chevailler - Président', 'Chevailler', 'Marius', '$2b$10$Y7hlha27eIRw0hVuKjBJlexoq00l.6BrMOW0IxppciotVY8BeQYly', '', 2, 'DAE_template_marius.chevailler@bds-efrei.fr.docx', 'Bureau');

-- --------------------------------------------------------

--
-- Structure de la table `users_groups`
--

CREATE TABLE `users_groups` (
  `users_groups_name` varchar(50) NOT NULL,
  `users_groups_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users_groups`
--

INSERT INTO `users_groups` (`users_groups_name`, `users_groups_type`) VALUES
('Bureau', 'ASSO'),
('Responsables Vie Associative', 'ADMIN'),
('Respos Sport', 'ASSO');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `form`
--
ALTER TABLE `form`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`users_email`),
  ADD KEY `users_groups_name` (`users_groups_name`);

--
-- Index pour la table `users_groups`
--
ALTER TABLE `users_groups`
  ADD PRIMARY KEY (`users_groups_name`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `form`
--
ALTER TABLE `form`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`users_groups_name`) REFERENCES `users_groups` (`users_groups_name`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
