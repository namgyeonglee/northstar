// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title NorthstarPromises
/// @notice A tamper-proof time capsule of promises to your future self.
///         Each promise stores an off-chain content URI (IPFS) plus an unlock
///         time, owned by the wallet that sealed it. No funds are held — this
///         contract only records, so there is no value to lose and no complex
///         settlement logic to go wrong.
contract NorthstarPromises {
    struct Promise {
        string uri; // IPFS URI of the promise content (JSON)
        uint256 unlockTime; // unix seconds — when the future self should read it
        uint256 sealedAt; // unix seconds — when it was sealed
    }

    // Each address owns an append-only list of sealed promises.
    mapping(address => Promise[]) private _promises;

    event PromiseSealed(
        address indexed owner,
        uint256 indexed index,
        string uri,
        uint256 unlockTime,
        uint256 sealedAt
    );

    /// @notice Seal a promise to your future self.
    /// @param uri IPFS URI pointing to the promise content.
    /// @param unlockTime Unix timestamp when the promise is meant to be revisited.
    /// @return index The index of the newly sealed promise for msg.sender.
    function sealPromise(string calldata uri, uint256 unlockTime)
        external
        returns (uint256 index)
    {
        index = _promises[msg.sender].length;
        _promises[msg.sender].push(
            Promise({uri: uri, unlockTime: unlockTime, sealedAt: block.timestamp})
        );
        emit PromiseSealed(msg.sender, index, uri, unlockTime, block.timestamp);
    }

    /// @notice How many promises an address has sealed.
    function promiseCount(address owner) external view returns (uint256) {
        return _promises[owner].length;
    }

    /// @notice Read a single sealed promise by index.
    function getPromise(address owner, uint256 index)
        external
        view
        returns (string memory uri, uint256 unlockTime, uint256 sealedAt)
    {
        Promise storage p = _promises[owner][index];
        return (p.uri, p.unlockTime, p.sealedAt);
    }

    /// @notice Read all promises sealed by an address (for verification UIs).
    function getPromises(address owner)
        external
        view
        returns (Promise[] memory)
    {
        return _promises[owner];
    }
}
