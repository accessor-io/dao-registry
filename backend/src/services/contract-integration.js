const { ethers } = require('ethers');
const DAORegistryABI = require('../contracts/DAORegistry.sol.json').abi;

class ContractIntegrationService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL || 'http://localhost:8545');
    this.contractAddress = process.env.DAO_REGISTRY_CONTRACT_ADDRESS;
    this.contract = new ethers.Contract(this.contractAddress, DAORegistryABI, this.provider);
  }

  // =======================================================================
  // CORE DAO DATA INTEGRATION
  // =======================================================================

  async getDAOInfo(daoId) {
    try {
      const daoInfo = await this.contract.getDAO(daoId);
      
      return {
        source: 'on_chain',
        category: 'contract_event',
        daoId: daoId.toString(),
        data: {
          name: daoInfo.name,
          symbol: daoInfo.symbol,
          description: daoInfo.description,
          logo: daoInfo.logo,
          website: daoInfo.website,
          contractAddress: daoInfo.contractAddress,
          tokenAddress: daoInfo.tokenAddress,
          treasuryAddress: daoInfo.treasuryAddress,
          governanceAddress: daoInfo.governanceAddress,
          chainId: daoInfo.chainId.toString(),
          createdAt: new Date(daoInfo.createdAt * 1000).toISOString(),
          updatedAt: new Date(daoInfo.updatedAt * 1000).toISOString(),
          verified: daoInfo.verified,
          active: daoInfo.active,
          status: this.mapDAOStatus(daoInfo.status),
          governanceType: this.mapGovernanceType(daoInfo.governanceType),
          votingPeriod: daoInfo.votingPeriod.toString(),
          quorum: daoInfo.quorum.toString(),
          proposalThreshold: daoInfo.proposalThreshold.toString(),
          tags: daoInfo.tags,
          socialLinks: {
            twitter: daoInfo.socialLinks.twitter,
            discord: daoInfo.socialLinks.discord,
            telegram: daoInfo.socialLinks.telegram,
            github: daoInfo.socialLinks.github,
            medium: daoInfo.socialLinks.medium,
            reddit: daoInfo.socialLinks.reddit
          }
        }
      };
    } catch (error) {
      console.error('Error fetching DAO info from contract:', error);
      throw error;
    }
  }

  async getDAOByAddress(contractAddress) {
    try {
      const daoId = await this.contract.getDAOByAddress(contractAddress);
      if (daoId.toString() === '0') {
        return null;
      }
      return await this.getDAOInfo(daoId);
    } catch (error) {
      console.error('Error fetching DAO by address:', error);
      throw error;
    }
  }

  async getAllDAOs() {
    try {
      const totalDAOs = await this.contract.getTotalDAOs();
      const daos = [];
      
      for (let i = 1; i <= totalDAOs; i++) {
        try {
          const daoInfo = await this.getDAOInfo(i);
          if (daoInfo.data.active) {
            daos.push(daoInfo);
          }
        } catch (error) {
          console.error(`Error fetching DAO ${i}:`, error);
        }
      }
      
      return daos;
    } catch (error) {
      console.error('Error fetching all DAOs:', error);
      throw error;
    }
  }

  // =======================================================================
  // PROPOSAL DATA INTEGRATION
  // =======================================================================

  async getProposalInfo(proposalId) {
    try {
      const proposalInfo = await this.contract.getProposal(proposalId);
      
      return {
        source: 'on_chain',
        category: 'contract_event',
        proposalId: proposalId.toString(),
        daoId: proposalInfo.daoId.toString(),
        data: {
          proposer: proposalInfo.proposer,
          title: proposalInfo.title,
          description: proposalInfo.description,
          startTime: new Date(proposalInfo.startTime * 1000).toISOString(),
          endTime: new Date(proposalInfo.endTime * 1000).toISOString(),
          quorum: proposalInfo.quorum.toString(),
          forVotes: proposalInfo.forVotes.toString(),
          againstVotes: proposalInfo.againstVotes.toString(),
          abstainVotes: proposalInfo.abstainVotes.toString(),
          executed: proposalInfo.executed,
          canceled: proposalInfo.canceled,
          executedAt: proposalInfo.executedAt > 0 ? new Date(proposalInfo.executedAt * 1000).toISOString() : null,
          status: this.mapProposalStatus(proposalInfo.status),
          actions: proposalInfo.actions.map(action => ({
            target: action.target,
            value: action.value.toString(),
            signature: action.signature,
            data: action.data
          }))
        }
      };
    } catch (error) {
      console.error('Error fetching proposal info from contract:', error);
      throw error;
    }
  }

  async getDAOProposals(daoId, status = null) {
    try {
      // This would need to be implemented with event filtering
      // For now, return a placeholder structure
      return {
        source: 'on_chain',
        category: 'contract_event',
        daoId: daoId.toString(),
        data: {
          proposals: [], // Would be populated with actual proposal data
          totalCount: 0,
          activeCount: 0
        }
      };
    } catch (error) {
      console.error('Error fetching DAO proposals:', error);
      throw error;
    }
  }

  // =======================================================================
  // MEMBER DATA INTEGRATION
  // =======================================================================

  async getMemberInfo(memberId) {
    try {
      const memberInfo = await this.contract.getMember(memberId);
      
      return {
        source: 'on_chain',
        category: 'contract_event',
        memberId: memberId.toString(),
        daoId: memberInfo.daoId.toString(),
        data: {
          memberAddress: memberInfo.memberAddress,
          tokenBalance: memberInfo.tokenBalance.toString(),
          votingPower: memberInfo.votingPower.toString(),
          proposalsCreated: memberInfo.proposalsCreated.toString(),
          proposalsVoted: memberInfo.proposalsVoted.toString(),
          lastActivity: new Date(memberInfo.lastActivity * 1000).toISOString(),
          active: memberInfo.active,
          roles: memberInfo.roles.map(role => this.mapMemberRole(role))
        }
      };
    } catch (error) {
      console.error('Error fetching member info from contract:', error);
      throw error;
    }
  }

  async getDAOMembers(daoId) {
    try {
      // This would need to be implemented with event filtering
      return {
        source: 'on_chain',
        category: 'contract_event',
        daoId: daoId.toString(),
        data: {
          members: [], // Would be populated with actual member data
          totalCount: 0,
          activeCount: 0
        }
      };
    } catch (error) {
      console.error('Error fetching DAO members:', error);
      throw error;
    }
  }

  // =======================================================================
  // ANALYTICS DATA INTEGRATION
  // =======================================================================

  async getDAOAnalytics(daoId) {
    try {
      const analytics = await this.contract.getAnalytics(daoId);
      
      return {
        source: 'on_chain',
        category: 'contract_event',
        daoId: daoId.toString(),
        data: {
          totalProposals: analytics.totalProposals.toString(),
          activeProposals: analytics.activeProposals.toString(),
          totalMembers: analytics.totalMembers.toString(),
          activeMembers: analytics.activeMembers.toString(),
          treasuryValue: analytics.treasuryValue.toString(),
          participationRate: analytics.participationRate.toString(),
          averageVotingPower: analytics.averageVotingPower.toString(),
          lastUpdated: new Date(analytics.lastUpdated * 1000).toISOString()
        }
      };
    } catch (error) {
      console.error('Error fetching DAO analytics from contract:', error);
      throw error;
    }
  }

  // =======================================================================
  // GOVERNANCE DATA INTEGRATION
  // =======================================================================

  async getGovernanceData(daoId) {
    try {
      const daoInfo = await this.contract.getDAO(daoId);
      
      return {
        source: 'on_chain',
        category: 'contract_event',
        daoId: daoId.toString(),
        data: {
          governanceType: this.mapGovernanceType(daoInfo.governanceType),
          votingPeriod: daoInfo.votingPeriod.toString(),
          quorum: daoInfo.quorum.toString(),
          proposalThreshold: daoInfo.proposalThreshold.toString(),
          governanceAddress: daoInfo.governanceAddress,
          tokenAddress: daoInfo.tokenAddress
        }
      };
    } catch (error) {
      console.error('Error fetching governance data from contract:', error);
      throw error;
    }
  }

  // =======================================================================
  // TREASURY DATA INTEGRATION
  // =======================================================================

  async getTreasuryData(daoId) {
    try {
      const daoInfo = await this.contract.getDAO(daoId);
      const analytics = await this.contract.getAnalytics(daoId);
      
      return {
        source: 'on_chain',
        category: 'contract_event',
        daoId: daoId.toString(),
        data: {
          treasuryAddress: daoInfo.treasuryAddress,
          treasuryValue: analytics.treasuryValue.toString(),
          // Additional treasury data would be fetched from treasury contract
          assets: [], // Would be populated from treasury contract
          transactions: [] // Would be populated from treasury contract events
        }
      };
    } catch (error) {
      console.error('Error fetching treasury data from contract:', error);
      throw error;
    }
  }

  // =======================================================================
  // VOTING DATA INTEGRATION
  // =======================================================================

  async getVotingData(daoId) {
    try {
      const analytics = await this.contract.getAnalytics(daoId);
      
      return {
        source: 'on_chain',
        category: 'contract_event',
        daoId: daoId.toString(),
        data: {
          participationRate: analytics.participationRate.toString(),
          averageVotingPower: analytics.averageVotingPower.toString(),
          totalProposals: analytics.totalProposals.toString(),
          activeProposals: analytics.activeProposals.toString(),
          // Additional voting data would be fetched from governance contract
          recentVotes: [], // Would be populated from governance contract events
          votingHistory: [] // Would be populated from governance contract events
        }
      };
    } catch (error) {
      console.error('Error fetching voting data from contract:', error);
      throw error;
    }
  }

  // =======================================================================
  // UTILITY FUNCTIONS
  // =======================================================================

  mapDAOStatus(status) {
    const statusMap = {
      0: 'Pending',
      1: 'Active',
      2: 'Suspended',
      3: 'Inactive',
      4: 'Banned'
    };
    return statusMap[status] || 'Unknown';
  }

  mapGovernanceType(type) {
    const typeMap = {
      0: 'TokenWeighted',
      1: 'Quadratic',
      2: 'Reputation',
      3: 'Liquid',
      4: 'Hybrid'
    };
    return typeMap[type] || 'Unknown';
  }

  mapProposalStatus(status) {
    const statusMap = {
      0: 'Pending',
      1: 'Active',
      2: 'Succeeded',
      3: 'Defeated',
      4: 'Executed',
      5: 'Canceled',
      6: 'Expired'
    };
    return statusMap[status] || 'Unknown';
  }

  mapMemberRole(role) {
    const roleMap = {
      0: 'Member',
      1: 'Moderator',
      2: 'Admin',
      3: 'Owner'
    };
    return roleMap[role] || 'Unknown';
  }

  // =======================================================================
  // EVENT LISTENING
  // =======================================================================

  async listenToEvents() {
    try {
      // Listen to DAO registration events
      this.contract.on('DAORegistered', (daoId, contractAddress, name, chainId) => {
        console.log(`New DAO registered: ${name} (ID: ${daoId})`);
        // Emit to WebSocket or update cache
      });

      // Listen to proposal events
      this.contract.on('ProposalCreated', (proposalId, daoId, proposer) => {
        console.log(`New proposal created: ${proposalId} for DAO ${daoId}`);
        // Emit to WebSocket or update cache
      });

      // Listen to voting events
      this.contract.on('ProposalVoted', (proposalId, voter, support, weight) => {
        console.log(`Vote cast: ${voter} voted ${support} on proposal ${proposalId}`);
        // Emit to WebSocket or update cache
      });

      console.log('Contract event listeners initialized');
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }

  // =======================================================================
  // HEALTH CHECK
  // =======================================================================

  async healthCheck() {
    try {
      const totalDAOs = await this.contract.getTotalDAOs();
      const contractAddress = await this.contract.address;
      
      return {
        status: 'healthy',
        contractAddress,
        totalDAOs: totalDAOs.toString(),
        lastChecked: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastChecked: new Date().toISOString()
      };
    }
  }
}

module.exports = ContractIntegrationService; 